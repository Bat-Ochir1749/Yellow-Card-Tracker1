import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Remove rewrite because my local server now expects /api prefix
        // Wait, no. My local server (api/index.js) has `app.use('/api', router)`.
        // So it expects /api.
        // So if I request /api/students, it should go to http://localhost:3000/api/students.
        // So rewrite is NOT needed if the path matches.
      }
    }
  }
})
