import { defineConfig } from 'vite'

// The site is served from https://sophicsunfish-boop.github.io/website/,
// so every built URL needs the /website/ prefix.
export default defineConfig({
  base: '/website/',
})
