import 'lenis/dist/lenis.css'
import './style.css'
import Lenis from 'lenis'
import headshotImg from './assets/headshot.jpg'
import cowVideo from './assets/cowbackground_layered.mp4'
import { initLayeredHero } from './layeredHero.js'

document.querySelector('#app').innerHTML = `
<!-- Menu at the top of the screen; each link glides to the section with that id -->
<nav class="top-nav" aria-label="Main">
  <a href="#about">about me</a>
  <a href="#writing">writing</a>
  <a href="#media">media</a>
</nav>

<div id="hero-track">
  <section id="center">
    <video class="bg-video" src="${cowVideo}" autoplay muted loop playsinline aria-hidden="true"></video>
    <h1 class="name">jimmy wu <span class="name-zh" lang="zh">伍芮藍</span></h1>
  </section>

  <!-- Scrolling through this space plays the name's rise and pause (see --rise-distance) -->
  <div class="rise-space"></div>

  <!-- Everything in here scrolls over the frozen cow video. Each .page is one full screen. -->
  <section id="about" class="page">
    <!-- <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500"> -->
    <p>A physicist by training, I'm currently studying Policy and Computer Science at ETH Zürich, with a focus on comparative AI governance. </p>
    <p> Prior, I held roles in teaching, technology policy, and management consulting.</p>
    <p> My mission remained unchanged: connecting people with each other, and with nature, through science. </p>
  </section>

  <section id="writing" class="page">
    <h2>writing</h2>
    <p>Articles, essays and research will go here.</p>
  </section>

  <section id="media" class="page">
    <h2>media</h2>
    <p>Talks, interviews and press will go here.</p>
  </section>
</div>
`

// Name in the middle of the video, tucked behind the cows
const hero = initLayeredHero(
  document.querySelector('#center'),
  document.querySelector('.bg-video'),
  document.querySelector('.name'), // size, position and colour: see .name in style.css
)

// Smooth scrolling; anchors: true also smooth-scrolls in-page links like href="#headshot"
new Lenis({ autoRaf: true, anchors: true })

// Scrolling through .rise-space raises the name and pauses; after that it scrolls away.
// Lenis smooths by moving the real page, so following window.scrollY follows the smoothed scroll.
const riseSpace = document.querySelector('.rise-space')
function updateRise() {
  const distance = riseSpace.offsetHeight
  hero.setProgress(distance > 0 ? window.scrollY / distance : 1)
  hero.setScrollAway(window.scrollY - distance)
}
window.addEventListener('scroll', updateRise, { passive: true })
window.addEventListener('resize', updateRise)
updateRise()
