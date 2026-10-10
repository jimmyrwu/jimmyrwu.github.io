// =====================================================================================
// layeredHero.js: the cow video with your name and page content layered "inside" it
// =====================================================================================
//
// THE BIG IDEA
// The screen is built from three layers stacked on top of each other, like sheets of glass:
//
//   1. BACK   (.hero-canvas, inside the pinned #center section)
//             the full cow video + your name. Drawn with a simple 2D canvas.
//   2. MIDDLE the page's normal HTML (your text, headshot…), scrolling as usual.
//   3. FRONT  (.hero-foreground, fixed on top of everything)
//             ONLY the cows and the hill, cut out of the same video.
//             Everywhere else this layer is see-through.
//
// Because the cows are drawn again on the very top layer, anything underneath (your name,
// your page text) looks like it's behind them. Clicks pass through the front layer
// (pointer-events: none in style.css), so links underneath still work.
//
// THE VIDEO FILE (cowbackground_layered.mp4)
// It's two videos stacked on top of each other in one file, 1920×2160:
//   top half    = the normal colour footage
//   bottom half = a black-and-white "matte": white where the cows + hill are, black elsewhere
// The front layer uses that matte to decide which pixels are visible (white) or see-through
// (black). Keeping both in one file guarantees they're always on exactly the same frame.
//
// THE NAME'S MOVEMENT
// While you scroll through .rise-space the page holds still: the name rises from behind the
// hill and settles, then holds for a moment (the pause). After that it scrolls up and away
// with the page. main.js reports the scroll via setProgress() and setScrollAway().
//
// WHAT TALKS TO WHAT
//   main.js      calls initLayeredHero(...) once, then setProgress()/setScrollAway() on every scroll
//   style.css    holds the name's settings (--name-height etc.), which this file reads
// =====================================================================================


// -------------------------------------------------------------------------------------
// SHADERS: tiny programs that run on the graphics chip, once per pixel, every frame.
// Only the FRONT layer uses them (the back layer is a plain 2D canvas).
// -------------------------------------------------------------------------------------

// Vertex shader: draws one rectangle covering the whole canvas and tells the pixel shader
// where each pixel is, as vUv: (0,0) = top-left corner, (1,1) = bottom-right corner.
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // top-left origin
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

// Pixel ("fragment") shader: decides the colour + transparency of every pixel of the front layer.
const FRAG = `
precision mediump float;
uniform sampler2D uVideo;      // the current video frame (colour on top, matte below)
uniform vec2 uScale;           // how much of the video fits on screen (for the cover crop)
uniform vec2 uOffset;          // where that visible part starts (for the cover crop)
varying vec2 vUv;              // this pixel's position on screen (0..1)
void main() {
  // Which point of the video belongs at this pixel ("object-fit: cover" maths)
  vec2 v = vUv * uScale + uOffset;
  // Colour from the TOP half of the video file (y * 0.5)
  vec3 colour = texture2D(uVideo, vec2(v.x, v.y * 0.5)).rgb;
  // How "foreground" this pixel is, from the BOTTOM half (the matte): 1 = cow/hill, 0 = sky.
  // smoothstep sharpens the soft edge so cows don't look blurry or ghostly.
  float fg = smoothstep(0.15, 0.85, texture2D(uVideo, vec2(v.x, 0.5 + v.y * 0.5)).r);
  // Final pixel: the cow/hill colour where the matte says so, see-through elsewhere.
  // ("Premultiplied" alpha: the colour is already multiplied by its opacity.)
  gl_FragColor = vec4(colour * fg, fg);
}`

// The colour footage is 16:9 (1920×1080). Used for the "cover" crop maths.
const VIDEO_ASPECT = 16 / 9


// -------------------------------------------------------------------------------------
// initLayeredHero: sets everything up. Called once from main.js.
//
//   section  the pinned #center section (the back layer goes inside it)
//   video    the hidden <video> element that plays cowbackground_layered.mp4
//   title    the <h1 class="name">: its text and CSS settings are used to draw your name
//
// Settings read from style.css (see readStyle below), on .name:
//   --name-height, --name-start-height, --name-rise-portion, --name-width, --name-shadow,
//   font-weight, color, font-family
// -------------------------------------------------------------------------------------
export function initLayeredHero(section, video, title) {
  // Tells style.css the canvases are in charge: it then hides the plain <video>
  // and the HTML name (it stays in the page for screen readers and search engines)
  section.classList.add('layered')

  // ---- BACK LAYER: a plain 2D canvas, inserted as the first thing inside #center ----
  const back = document.createElement('canvas')
  back.className = 'hero-canvas'
  back.setAttribute('aria-hidden', 'true') // decorative: screen readers skip it
  section.prepend(back)
  const bctx = back.getContext('2d')

  // ---- FRONT LAYER: a WebGL canvas, added AFTER the page content so it sits on top ----
  const front = document.createElement('canvas')
  front.className = 'hero-foreground'
  front.setAttribute('aria-hidden', 'true')
  section.parentElement.append(front)
  // WebGL = graphics-chip drawing, needed to cut the cows out using the matte.
  // alpha: true lets the front layer be see-through where there are no cows.
  const gl = front.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
  // Rare browsers without WebGL: skip the front layer. The page still shows the video
  // and your name; the only thing lost is content going "behind" the cows.
  if (!gl) front.remove()

  // Handles to the shader settings and the video picture ("texture"), filled in below
  let uScale, uOffset, videoTex
  if (gl) {
    // Compile the two shaders above and combine them into one program
    const program = gl.createProgram()
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    gl.useProgram(program)

    // The rectangle to draw: its 4 corners, (-1,-1) to (1,1) = the whole canvas
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // A "texture" is a picture the graphics chip can read from: here, the video frame
    videoTex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, videoTex)
    // Don't repeat the picture at the edges, and blend smoothly between pixels
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(gl.getUniformLocation(program, 'uVideo'), 0)
    // Remember where the adjustable shader settings live, so we can change them later
    uScale = gl.getUniformLocation(program, 'uScale')
    uOffset = gl.getUniformLocation(program, 'uOffset')
  }

  // ---- NAME PICTURE ----
  // Drawing text is relatively slow, so the name is drawn ONCE into an invisible canvas
  // (redrawn only when the window size or the CSS changes). Every frame we then just
  // place that finished picture at the right height.
  const nameCanvas = document.createElement('canvas')
  const nctx = nameCanvas.getContext('2d')

  // Reads the name's settings from style.css.
  // num() turns a CSS value like "0.46" into a number, or uses the fallback if it's missing.
  function readStyle() {
    const css = getComputedStyle(title)
    const num = (name, fallback) => parseFloat(css.getPropertyValue(name)) || fallback
    return {
      height: num('--name-height', 0.55),
      startHeight: num('--name-start-height', 1.15),
      risePortion: num('--name-rise-portion', 0.6),
      width: num('--name-width', 0.8),
      textLimit: num('--text-limit', 0.53),
      shadow: num('--name-shadow', 0.25),
      weight: css.fontWeight,
      color: css.color,
      fontFamily: css.fontFamily,
    }
  }

  // ---- SCROLL STATE ----
  // progress goes 0 → 1 as you scroll through .rise-space (main.js works it out):
  //   0 .. risePortion   the name rises from --name-start-height to --name-height
  //   risePortion .. 1   it holds still: the pause
  // After that, `away` grows as you keep scrolling, moving it up off the screen.
  // Distances are in "screen heights": 1 = the full height of the screen.
  let progress = 0
  let rise = 0        // how far below its final spot the name starts (behind the hill)
  let risePortion = 0.6
  let away = 0
  // Ease-out curve: movement is quick at first and slows down gently as it settles.
  // Input 0..1 (clamped), output 0..1.
  const easeOut = (t) => 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3
  // Where the name is drawn relative to its final spot (positive = lower on screen)
  const nameShift = () => rise * (1 - easeOut(progress / risePortion)) - away

  // ---- LAYOUT: runs at start, whenever the window resizes, and when style.css changes ----
  let w = 0, h = 0, scale = [1, 1] // canvas size in real pixels, and the cover-crop scale
  function layout() {
    const { height, startHeight, width, shadow, weight, color, fontFamily, ...rest } = readStyle()
    risePortion = rest.risePortion

    // Match the canvases to the screen. dpr = pixel density (2 on Retina screens), capped
    // at 2 so phones with very dense screens don't do needless extra work.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = Math.round(section.clientWidth * dpr)
    h = Math.round(section.clientHeight * dpr)
    for (const c of [back, front, nameCanvas]) {
      c.width = w
      c.height = h
    }

    // "object-fit: cover": scale the 16:9 video to fill the screen and crop what sticks out.
    // Wider screen than 16:9 → crop top and bottom. Taller screen (phones) → crop the sides.
    const aspect = w / h
    scale = aspect > VIDEO_ASPECT ? [1, VIDEO_ASPECT / aspect] : [aspect / VIDEO_ASPECT, 1]
    if (gl) {
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uScale, scale[0], scale[1])
      gl.uniform2f(uOffset, (1 - scale[0]) / 2, (1 - scale[1]) / 2)
    }
    // Distance the name rises, converted from "video heights" to "screen heights"
    rise = (startHeight - height) / scale[1]

    // Draw the NAME picture: as wide as --name-width of the screen, but never taller than
    // 30% of the video. First measure the text at 100px, then scale to the size we want.
    const videoHeightOnScreen = h / scale[1]
    // The main name is the <h1>'s own text; a <span class="name-zh"> inside it is the second line
    const zh = title.querySelector('.name-zh')
    const nameText = [...title.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent).join('').trim()
    nctx.font = `${weight} 100px ${fontFamily}`
    const size = Math.min((width * w) / nctx.measureText(nameText).width * 100, 0.3 * videoHeightOnScreen)
    nctx.font = `${weight} ${size}px ${fontFamily}`
    nctx.textAlign = 'center'
    nctx.fillStyle = color
    nctx.shadowColor = `rgba(0, 0, 0, ${shadow})`
    nctx.shadowBlur = size * 0.08
    // Converts a height in the video (0 = top, 1 = bottom) to a pixel row on screen,
    // so the name always lines up with the same spot on the hill, whatever the screen shape
    const toScreenY = (videoY) => (videoY - (1 - scale[1]) / 2) / scale[1] * h
    nctx.fillText(nameText, w / 2, toScreenY(height))

    // Tell style.css where the top of the cows is on this screen (in CSS pixels), so page text
    // can stay above it: --cows-top, used by .page-inner. Changes with the screen's shape.
    document.documentElement.style.setProperty('--cows-top', `${toScreenY(readStyle().textLimit) / dpr}px`)

    // Chinese name: a smaller line under the name, lined up with the right edge of the name.
    // Settings on .name-zh in style.css: --zh-size (× the name's size), --zh-gap, font-weight.
    // PP Mori has no Chinese characters, so the browser uses the system's Chinese font.
    if (zh && zh.textContent.trim()) {
      const z = getComputedStyle(zh)
      const zhNum = (prop, fallback) => parseFloat(z.getPropertyValue(prop)) || fallback
      const zhSize = size * zhNum('--zh-size', 0.3)
      const rightEdge = w / 2 + nctx.measureText(nameText).width / 2
      nctx.font = `${z.fontWeight} ${zhSize}px ${z.fontFamily}`
      nctx.textAlign = 'right'
      nctx.fillStyle = z.color
      nctx.shadowBlur = zhSize * 0.15
      nctx.fillText(zh.textContent.trim(), rightEdge, toScreenY(height) + zhSize * (1 + zhNum('--zh-gap', 0.3)))
    }
  }

  // ---- DRAW: runs every screen refresh (usually 60 times a second) ----
  // Both layers are drawn from the SAME video frame in the same moment, so the cut-out
  // cows on the front layer always line up exactly with the cows on the back layer.
  function draw() {
    if (video.readyState >= 2 && w && h) { // only once the video has a frame to show
      // BACK: copy the colour half of the video onto the canvas, cropped like "cover"...
      const vw = video.videoWidth, vh = video.videoHeight / 2
      bctx.drawImage(video, (1 - scale[0]) / 2 * vw, (1 - scale[1]) / 2 * vh, scale[0] * vw, scale[1] * vh, 0, 0, w, h)
      // ...then place the name picture at its current height
      bctx.drawImage(nameCanvas, 0, nameShift() * h)
      if (gl) {
        // FRONT: send this video frame to the graphics chip and run the shaders
        gl.bindTexture(gl.TEXTURE_2D, videoTex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
    }
    requestAnimationFrame(draw) // ask the browser to call draw() again next refresh
  }

  // ---- START IT ALL UP ----
  layout()
  new ResizeObserver(layout).observe(section) // re-layout when the section changes size
  const { weight, fontFamily } = readStyle()
  document.fonts.load(`${weight} 1em ${fontFamily}`).then(layout) // redraw once PP Mori has loaded
  if (import.meta.hot) {
    // Only while running `npm run dev`: saving style.css swaps the stylesheet without
    // reloading the page, so redraw the name to pick up your new settings
    new MutationObserver(layout).observe(document.head, { childList: true, subtree: true, characterData: true })
  }
  requestAnimationFrame(draw)

  // ---- CONTROLS for main.js ----
  return {
    // p = 0 → 1 while scrolling through .rise-space: the rise, then the pause
    setProgress(p) {
      progress = Math.min(Math.max(p, 0), 1)
    },
    // Scroll the name up like normal page content; the video stays put.
    // px = how far (in pixels) past the end of .rise-space the page has scrolled
    setScrollAway(px) {
      away = Math.max(px, 0) / section.clientHeight
    },
  }
}
