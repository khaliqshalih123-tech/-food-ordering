import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
 proxy: {
    '/api': 'https://food-ordering-backend-bm0c.onrender.com',
    '/images': 'https://food-ordering-backend-bm0c.onrender.com'

  }
})
