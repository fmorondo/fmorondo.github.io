import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Configura la base para el despliegue en subcarpeta de GitHub Pages
  base: '/pdf-to-jpg/',
  server: {
    port: 3000, // Puerto para desarrollo local
  }
})