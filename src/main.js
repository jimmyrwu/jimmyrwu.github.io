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

// Icons from Bootstrap Icons (https://icons.getbootstrap.com, MIT licence), drawn in the text colour
const linkedinIcon = `<svg class="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>`
const fileIcon = `<svg class="icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/><path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/></svg>`


// ---- 2. PAGE CONTENT ----
// Plain HTML inside the backticks. Comments here are <!-- … -->, not //.
// To add a page: add a <section id="…" class="page"> inside #hero-track, plus a menu link to it.
document.querySelector('#app').innerHTML = `
<!-- Menu at the top of the screen; each link glides to the section with that id -->
<nav class="top-nav" aria-label="Main">
  <a href="#about" data-t="nav-about">about me</a>
  <a href="#writing" data-t="nav-writing">writing</a>
  <a href="#media" data-t="nav-media">media</a>
  <a href="#cv" data-t="nav-cv">cv</a>
  <a href="#contact" data-t="nav-contact">contact</a>
  <!-- Language switch: shows the language you can switch TO -->
  <button class="lang-toggle" type="button">中文</button>
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

  <!-- About me, one line at a time: each <section class="page"> is one step that rises,
       pauses, and scrolls away before the next. The menu's "about me" goes to the first. -->
  <section id="about" class="page">
    <!-- <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500"> -->
    <p data-t="about1">A physicist by training, I'm currently studying Policy and Computer Science at ETH Zürich, with a focus on comparative AI governance.</p>
  </section>

  <section class="page">
    <p data-t="about2">Prior, I held roles in teaching, technology policy, and management consulting.</p>
  </section>

  <section class="page">
    <p data-t="about3">My goal remains unchanged: <span class="extraBold">connecting people with each other, and with nature, through science.</span></p>
  </section>

  <section id="writing" class="page">
    <h2 data-t="writing-title">writing</h2>
    <p data-t="writing-text">Articles, essays and research will go here.</p>
  </section>

  <section id="media" class="page">
    <h2 data-t="media-title">media</h2>
    <p data-t="media-text">Talks, interviews and press will go here.</p>
  </section>

  <!-- CV highlights, newest first. Each line: <span class="when">years</span> <span class="what">…</span> -->
  <section id="cv" class="page">
    <h2 data-t="cv-title">cv</h2>
    
    <p><a class="icon-link" href="/jimmy-wu-cv.pdf" target="_blank" rel="noopener">${fileIcon}<span data-t="cv-pdf">full CV (PDF)</span></a></p>
  </section>

  <!-- Replace the email placeholder (in both places on its line) -->
  <section id="contact" class="page">
    <h2 data-t="contact-title">contact</h2>
    <p data-t="contact-text">I'm always happy to talk about AI governance, teaching, or cows.</p>
    <p><a href="mailto:your.email@example.com">your.email@example.com</a></p>
    <p><a class="icon-link" href="https://www.linkedin.com/in/jimmy-wu-41965812a/" target="_blank" rel="noopener" aria-label="LinkedIn">${linkedinIcon}</a></p>
  </section>

</div>
`


// ---- 2b. CHINESE VERSION (Traditional) ----
// The English is the HTML above. Each piece of text marked data-t="…" there has its Chinese
// here, under the same label. To translate something new: add data-t="new-label" to it above,
// and a 'new-label': '…' line here. Pieces without a Chinese line simply stay in English.
// Placeholder until the full Chinese text is written: every page shows the same note.
const comingSoon = '中文版即將推出'
const zh = {
  'nav-about': '關於我',
  'nav-writing': '寫作',
  'nav-media': '媒體',
  'nav-cv': '履歷',
  'nav-contact': '聯絡',
  'about1': comingSoon,
  'about2': comingSoon,
  'about3': comingSoon,
  'writing-title': comingSoon,
  'writing-text': '',
  'media-title': comingSoon,
  'media-text': '',
  'cv-title': comingSoon,
  'cv-pdf': '完整履歷（PDF，英文）',
  'contact-title': comingSoon,
  'contact-text': '',
}


// ---- 3. START-UP ----

// Wrap each page's content in a .page-inner, which holds still for a moment (--page-pause)
// before the next page comes, like the pause after your name rises. Done here so the
// page HTML above stays simple.
for (const page of document.querySelectorAll('.page')) {
  const inner = document.createElement('div')
  inner.className = 'page-inner'
  inner.append(...page.childNodes)
  page.append(inner)
}

// The cow video in layers, with your name tucked behind the cows (see layeredHero.js)
const hero = initLayeredHero(
  document.querySelector('#center'),
  document.querySelector('.bg-video'),
  document.querySelector('.name'),
)

// Smooth scrolling; anchors: true also glides to menu links like href="#about".
// GSAP's clock drives Lenis, so smooth scrolling and the GSAP animations below stay in step.
gsap.registerPlugin(ScrollTrigger)
const lenis = new Lenis({
  anchors: true,
  wheelMultiplier: 0.5, // scroll speed for mouse wheel / trackpad: 1 = normal, 0.5 = half speed
  touchMultiplier: 0.5, // same for touch screens (applies where Lenis handles touch)
})
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
    gsap.from(page.querySelector('.page-inner').children, {
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

// Language toggle (EN / 中文). The choice is remembered, and ?lang=zh in the address opens the
// Chinese version directly, so you can send people a link to it.
const langButton = document.querySelector('.lang-toggle')
function setLanguage(lang) {
  for (const el of document.querySelectorAll('[data-t]')) {
    if (el.dataset.en === undefined) el.dataset.en = el.innerHTML // keep the English to switch back to
    el.innerHTML = lang === 'zh' ? (zh[el.dataset.t] ?? el.dataset.en) : el.dataset.en
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'
  langButton.textContent = lang === 'zh' ? 'EN' : '中文'
  langButton.lang = lang === 'zh' ? 'en' : 'zh-Hant'
  langButton.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換至中文')
  const url = new URL(location.href)
  if (lang === 'zh') url.searchParams.set('lang', 'zh')
  else url.searchParams.delete('lang')
  history.replaceState(null, '', url)
  try { localStorage.setItem('lang', lang) } catch {}
  ScrollTrigger.refresh() // text lengths changed, so re-measure the scroll animations
}
langButton.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'))
let savedLang = null
try { savedLang = localStorage.getItem('lang') } catch {}
setLanguage(new URLSearchParams(location.search).get('lang') || savedLang || 'en')
