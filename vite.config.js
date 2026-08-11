import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the local Express dev server (npm run dev:api).
      // In production the same /api routes are served by Vercel/Netlify functions.
      '/api': 'http://localhost:3001',
    },
  },
})
