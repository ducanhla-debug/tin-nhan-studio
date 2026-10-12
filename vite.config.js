import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, createReadStream } from 'node:fs'
import { fileURLToPath } from 'node:url'

const localWeights = { 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold' }
const localFontPath = (weight, family = 'display') => fileURLToPath(new URL(family === 'text'
  ? `./.local-fonts/apple-text/Library/Fonts/SF-Pro-Text-${localWeights[weight]}.otf`
  : `./.local-fonts/SF-Pro-Display-${localWeights[weight]}.otf`, import.meta.url))
const localFonts = {
  name: 'private-local-fonts',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/__local-fonts/manifest') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(Object.fromEntries(['display', 'text'].map(family => [family, Object.keys(localWeights).filter(weight => existsSync(localFontPath(weight, family)))]))))
        return
      }
      const match = /^\/__local-fonts\/(display|text)\/(400|500|600|700)\.otf$/.exec(req.url || '')
      if (!match || !existsSync(localFontPath(match[2], match[1]))) return next()
      res.setHeader('Content-Type', 'font/otf')
      createReadStream(localFontPath(match[2], match[1])).pipe(res)
    })
  },
}

export default defineConfig({
  plugins: [react(), localFonts],
  base: './',
  build: { target: 'es2022' },
})
