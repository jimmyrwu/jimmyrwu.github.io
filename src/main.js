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
<section id="center">
  <video class="bg-video" src="${cowVideo}" autoplay muted loop playsinline aria-hidden="true"></video>
  <h1 class="name">jimmy wu</h1>
  <p class="tagline">educator and policy researcher</p>
</section>

<div class="ticks"></div>

<section id="headshot">
  <img src="${headshotImg}" alt="Headshot of Jimmy Wu" width="240" height="500">
</section>

<div class="ticks"></div>

<section id="next-steps">
  <div id="docs">
    ${icon('documentation-icon', 'icon')}
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
    ${icon('social-icon', 'icon')}
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      <li><a href="https://github.com/vitejs/vite" target="_blank">${icon('github-icon', 'button-icon')}GitHub</a></li>
      <li><a href="https://chat.vite.dev/" target="_blank">${icon('discord-icon', 'button-icon')}Discord</a></li>
      <li><a href="https://x.com/vite_js" target="_blank">${icon('x-icon', 'button-icon')}X.com</a></li>
      <li><a href="https://bsky.app/profile/vite.dev" target="_blank">${icon('bluesky-icon', 'button-icon')}Bluesky</a></li>
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
  document.querySelector('.name'),    // size, position and colour: see .name in style.css
  document.querySelector('.tagline'), // see .tagline in style.css
)

// Smooth scrolling; anchors: true also smooth-scrolls in-page links like href="#headshot"
new Lenis({ autoRaf: true, anchors: true })
