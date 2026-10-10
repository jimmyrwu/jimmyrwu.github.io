import { defineConfig } from 'vite'

// The site is served from https://jimmyrwu.github.io/ (a GitHub "user page", at the root),
// so built URLs need no prefix. If it ever moves to https://jimmyrwu.github.io/REPO-NAME/,
// change this to '/REPO-NAME/'.
export default defineConfig({
  base: '/',
})
