import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-is-dev'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {}
})
