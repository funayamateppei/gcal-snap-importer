import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gcal-snap-importer/',
  server: {
    headers: {
      // Google OAuth ポップアップとの互換性のため
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
