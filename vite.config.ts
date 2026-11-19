import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { API_BASE_URL } from './src/api/baseUrl.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        headers: { origin: API_BASE_URL },
      },
    },
  },
})
