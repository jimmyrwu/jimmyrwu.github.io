import 'lenis/dist/lenis.css'
import './style.css'
import Lenis from 'lenis'
import headshotImg from './assets/headshot.jpg'
import cowVideo from './assets/cowbackground_layered.mp4'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import { initLayeredHero } from './layeredHero.js'

document.querySelector('#app').innerHTML = `
<section id="center">
  <video class="bg-video" src="${cowVideo}" autoplay muted loop playsinline aria-hidden="true"></video>
  <h1 class="name">jimmy wu</h1>
</section>

<div class="ticks"></div>

<section id="headshot">
  <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500">
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#documentation-icon"></use></svg>
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://vite.dev/" target="_blank">
          <img class="logo" src="${viteLogo}" alt="" />
          Explore Vite
        </a>
      </li>
      <li>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
          <img class="button-icon" src="${javascriptLogo}" alt="">
          Learn more
        </a>
      </li>
    </ul>
  </div>
  <div id="social">
    <svg class="icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#social-icon"></use></svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#github-icon"></use></svg>GitHub</a></li>
      <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#discord-icon"></use></svg>Discord</a></li>
      <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#x-icon"></use></svg>X.com</a></li>
      <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="${import.meta.env.BASE_URL}icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
    </ul>
  </div>
</section>

<div class="ticks"></div>
<section id="spacer"></section>
`

// Name in the middle of the video, tucked behind the cows
initLayeredHero(
  document.querySelector('#center'),
  document.querySelector('.bg-video'),
  document.querySelector('.name'), // size, position and colour: see .name in style.css
)

// Smooth scrolling; anchors: true also smooth-scrolls in-page links like href="#headshot"
const lenis = new Lenis({ autoRaf: true, anchors: true })
