import 'lenis/dist/lenis.css'
import './style.css'
import Lenis from 'lenis'
import headshotImg from './assets/headshot.jpg'
import cowVideo from './assets/cowbackground_layered.mp4'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import { initLayeredHero } from './layeredHero.js'

// SVG icon from public/icons.svg
const icon = (id, cls) =>
  `<svg class="${cls}" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#${id}"></use></svg>`

document.querySelector('#app').innerHTML = `
<div id="hero-track">
  <section id="center">
    <video class="bg-video" src="${cowVideo}" autoplay muted loop playsinline aria-hidden="true"></video>
    <h1 class="name">jimmy wu</h1>
    <!-- Hidden at first; appears once you scroll past the name rising (see .tagline in style.css) -->
    <p class="tagline">educator and policy researcher</p>
  </section>
</div>

<div class="ticks"></div>

<section id="headshot">
  <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500">
</section>

<div class="ticks"></div>


<div class="ticks"></div>
<section id="spacer"></section>
`

// Name in the middle of the video, tucked behind the cows
const hero = initLayeredHero(
  document.querySelector('#center'),
  document.querySelector('.bg-video'),
  document.querySelector('.name'),    // size, position and colour: see .name in style.css
  document.querySelector('.tagline'), // see .tagline in style.css
)

// Smooth scrolling; anchors: true also smooth-scrolls in-page links like href="#headshot"
new Lenis({ autoRaf: true, anchors: true })

// While the hero is pinned (see #hero-track), scrolling raises the name, then brings in the tagline.
// Lenis smooths by moving the real page, so following window.scrollY follows the smoothed scroll.
const track = document.querySelector('#hero-track')
const center = document.querySelector('#center')
function updateRise() {
  const distance = track.offsetHeight - center.offsetHeight
  hero.setProgress(distance > 0 ? window.scrollY / distance : 1)
}
window.addEventListener('scroll', updateRise, { passive: true })
window.addEventListener('resize', updateRise)
updateRise()
