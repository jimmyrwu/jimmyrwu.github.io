// =====================================================================================
// main.js: what's on the page, and switching everything on
// =====================================================================================
// 1. IMPORTS       styles, libraries, images and video
// 2. PAGE CONTENT  the text and sections of your site (edit your writing here)
// 3. START-UP      the layered video, smooth scrolling, and the name's scroll animation
//
// Looks (sizes, colours, spacing, animation settings) live in style.css.
// =====================================================================================


// ---- 1. IMPORTS ----
import 'lenis/dist/lenis.css'
import './style.css'
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import headshotImg from './assets/headshot.jpg'
import cowVideo from './assets/cowbackground_layered.mp4'
import { initLayeredHero } from './layeredHero.js'


// ---- 2. PAGE CONTENT ----
// Plain HTML inside the backticks. Comments here are <!-- … -->, not //.
// To add a page: add a <section id="…" class="page"> inside #hero-track, plus a menu link to it.
document.querySelector('#app').innerHTML = `
<!-- Menu at the top of the screen; each link glides to the section with that id -->
<nav class="top-nav" aria-label="Main">
  <a href="#about">about me</a>
  <a href="#writing">writing</a>
  <a href="#media">media</a>
</nav>

<div id="hero-track">

  <!-- First screen: the cow video with your name (drawn by layeredHero.js) -->
  <section id="center">
    <video class="bg-video" src="${cowVideo}" autoplay muted loop playsinline aria-hidden="true"></video>
    <h1 class="name">jimmy wu <span class="name-zh" lang="zh">伍芮藍</span></h1>
  </section>

  <!-- Scrolling through this space plays the name's rise and pause (see --rise-distance) -->
  <div class="rise-space"></div>

  <!-- Pages: each one full screen, scrolling up from behind the cows -->

  <section id="about" class="page">
    <!-- <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500"> -->
    <p>A physicist by training, I'm currently studying Policy and Computer Science at ETH Zürich, with a focus on comparative AI governance.</p>
    <p>Prior, I held roles in teaching, technology policy, and management consulting.</p>
    <p>My mission remained unchanged: <span class="extraBold">connecting people with each other, and with nature, through science.</span></p>
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


// ---- 3. START-UP ----

// The cow video in layers, with your name tucked behind the cows (see layeredHero.js)
const hero = initLayeredHero(
  document.querySelector('#center'),
  document.querySelector('.bg-video'),
  document.querySelector('.name'),
)

// Smooth scrolling; anchors: true also glides to menu links like href="#about".
// GSAP's clock drives Lenis, so smooth scrolling and the GSAP animations below stay in step.
gsap.registerPlugin(ScrollTrigger)
const lenis = new Lenis({ anchors: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Snapping: when you stop scrolling near one of these points, the page glides to it.
// 'proximity' = only when you're close; 'mandatory' would always snap to the nearest one.
const snap = new Snap(lenis, { type: 'proximity', duration: 0.8 })
snap.add(0)                                                        // the top
snap.add(document.querySelector('.rise-space').offsetHeight)       // your name fully risen
snap.addElements(document.querySelectorAll('.page'), { align: 'start' }) // each page's top

// Each page's content fades and slides up as the page scrolls into view, following your scroll
if (!reduceMotion) {
  for (const page of document.querySelectorAll('.page')) {
    gsap.from(page.children, {
      opacity: 0,
      y: 40,          // starts 40px lower
      stagger: 0.1,   // each paragraph slightly after the one before
      ease: 'none',
      scrollTrigger: {
        trigger: page,
        start: 'top 85%', // animation starts when the page's top is 85% down the screen…
        end: 'top 30%',   // …and is finished by the time it's 30% down
        scrub: true,      // tied to the scroll position, not to time
      },
    })
  }
}

// The name's scroll animation: rises and pauses while scrolling through .rise-space,
// then scrolls away with the page. Lenis smooths by moving the real page, so following
// window.scrollY follows the smoothed scroll.
const riseSpace = document.querySelector('.rise-space')
function updateRise() {
  const distance = riseSpace.offsetHeight
  hero.setProgress(distance > 0 ? window.scrollY / distance : 1)
  hero.setScrollAway(window.scrollY - distance)
}
window.addEventListener('scroll', updateRise, { passive: true })
window.addEventListener('resize', updateRise)
updateRise()
