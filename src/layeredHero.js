// Draws the hero video with the name *between* the background and the cows.
//
// The video file is two frames stacked vertically:
//   top half    = the colour footage
//   bottom half = a black/white matte (white = cows + hill, i.e. the foreground)
// A WebGL shader composites: background -> name -> foreground (cows + hill) -> tagline.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // top-left origin
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform sampler2D uVideo;
uniform sampler2D uText;
uniform sampler2D uOverlay;
uniform vec2 uScale;
uniform vec2 uOffset;
varying vec2 vUv;
void main() {
  vec2 v = vUv * uScale + uOffset;                 // "object-fit: cover" into the colour frame
  vec3 colour = texture2D(uVideo, vec2(v.x, v.y * 0.5)).rgb;
  float fg = smoothstep(0.15, 0.85, texture2D(uVideo, vec2(v.x, 0.5 + v.y * 0.5)).r);
  vec4 text = texture2D(uText, vUv);               // premultiplied alpha
  float show = text.a * (1.0 - fg);                // the name is hidden wherever the foreground is
  vec3 behind = colour * (1.0 - show) + text.rgb * (1.0 - fg);
  vec4 overlay = texture2D(uOverlay, vUv);         // tagline, always on top
  gl_FragColor = vec4(behind * (1.0 - overlay.a) + overlay.rgb, 1.0);
}`

const VIDEO_ASPECT = 16 / 9

// The name's look comes from its CSS (see .name in style.css):
//   --name-height  where the baseline sits in the video, 0 = top, 1 = bottom
//   --name-width   how wide the name is, as a fraction of the screen
//   --name-shadow  soft shadow strength, 0 = none
//   font-weight, color, font-family
// The tagline (see .tagline) is drawn in front of everything, on the grass:
//   --tagline-size    font size as a fraction of the name's
//   --tagline-height  where its baseline sits in the video, 0 = top, 1 = bottom
export function initLayeredHero(section, video, title, tagline) {
  const canvas = document.createElement('canvas')
  canvas.className = 'hero-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  section.prepend(canvas)

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) {
    canvas.remove()
    section.classList.add('no-webgl')
    return
  }
  section.classList.add('layered')

  const program = gl.createProgram()
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const makeTexture = (unit) => {
    const tex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return tex
  }
  const videoTex = makeTexture(0)
  const textTex = makeTexture(1)
  const overlayTex = makeTexture(2)
  gl.uniform1i(gl.getUniformLocation(program, 'uVideo'), 0)
  gl.uniform1i(gl.getUniformLocation(program, 'uText'), 1)
  gl.uniform1i(gl.getUniformLocation(program, 'uOverlay'), 2)
  const uScale = gl.getUniformLocation(program, 'uScale')
  const uOffset = gl.getUniformLocation(program, 'uOffset')
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

  const textCanvas = document.createElement('canvas')
  const tctx = textCanvas.getContext('2d')
  const overlayCanvas = document.createElement('canvas')
  const octx = overlayCanvas.getContext('2d')
  function readStyle(el = title) {
    const css = getComputedStyle(el)
    const num = (name, fallback) => parseFloat(css.getPropertyValue(name)) || fallback
    return {
      height: num('--name-height', 0.55),
      width: num('--name-width', 0.8),
      shadow: num('--name-shadow', 0.25),
      taglineSize: num('--tagline-size', 0.16),
      taglineHeight: num('--tagline-height', 0.82),
      weight: css.fontWeight,
      color: css.color,
      fontFamily: css.fontFamily,
    }
  }

  function layout() {
    const { height, width, shadow, weight, color, fontFamily } = readStyle()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(section.clientWidth * dpr)
    const h = Math.round(section.clientHeight * dpr)
    canvas.width = textCanvas.width = overlayCanvas.width = w
    canvas.height = textCanvas.height = overlayCanvas.height = h
    gl.viewport(0, 0, w, h)

    // Same maths as object-fit: cover: which part of the video frame is on screen
    const aspect = w / h
    const scale = aspect > VIDEO_ASPECT ? [1, VIDEO_ASPECT / aspect] : [aspect / VIDEO_ASPECT, 1]
    gl.uniform2f(uScale, scale[0], scale[1])
    gl.uniform2f(uOffset, (1 - scale[0]) / 2, (1 - scale[1]) / 2)

    // Name: `width` of the screen (but never taller than 30% of the video), baseline at `height`
    const videoHeightOnScreen = h / scale[1]
    tctx.clearRect(0, 0, w, h)
    tctx.font = `${weight} 100px ${fontFamily}`
    const size = Math.min((width * w) / tctx.measureText(title.textContent).width * 100, 0.3 * videoHeightOnScreen)
    tctx.font = `${weight} ${size}px ${fontFamily}`
    tctx.textAlign = 'center'
    tctx.textBaseline = 'alphabetic'
    tctx.fillStyle = color
    tctx.shadowColor = `rgba(0, 0, 0, ${shadow})`
    tctx.shadowBlur = size * 0.08
    const toScreenY = (videoY) => (videoY - (1 - scale[1]) / 2) / scale[1] * h
    tctx.fillText(title.textContent, w / 2, toScreenY(height))

    // Tagline: centred, in front of the cows and hill
    octx.clearRect(0, 0, w, h)
    if (tagline) {
      const t = readStyle(tagline)
      const tSize = Math.max(size * t.taglineSize, 14 * dpr) // never smaller than 14px, for phones
      octx.font = `${t.weight} ${tSize}px ${t.fontFamily}`
      octx.textAlign = 'center'
      octx.fillStyle = t.color
      octx.shadowColor = `rgba(0, 0, 0, ${t.shadow})`
      octx.shadowBlur = tSize * 0.3
      octx.fillText(tagline.textContent, w / 2, toScreenY(t.taglineHeight))
    }

    for (const [unit, tex, src] of [[1, textTex, textCanvas], [2, overlayTex, overlayCanvas]]) {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
    }
  }

  function draw() {
    if (video.readyState >= 2) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, videoTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    schedule()
  }
  const schedule = video.requestVideoFrameCallback
    ? () => video.requestVideoFrameCallback(draw)
    : () => requestAnimationFrame(draw)

  layout()
  new ResizeObserver(layout).observe(section)
  const { weight, fontFamily } = readStyle()
  document.fonts.load(`${weight} 1em ${fontFamily}`).then(layout) // redraw once PP Mori has loaded
  if (import.meta.hot) {
    // Saving style.css swaps the stylesheet without reloading; redraw the name to match
    new MutationObserver(layout).observe(document.head, { childList: true, subtree: true, characterData: true })
  }
  schedule()
}
