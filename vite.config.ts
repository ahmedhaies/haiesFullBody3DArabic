import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site is served from /<repo>/.
// Allow overriding the base via env for custom domains / local preview.
const base = process.env.VITE_BASE ?? '/haiesFullBody3DArabic/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: 0,
  },
  assetsInclude: ['**/*.glb'],
})
