import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Ruta base para el despliegue en subcarpeta de GitHub Pages
  base: '/pdf-merger/', 
  server: {
    port: 3000,
  },
  build: {
    // FIX: Habilita el target ES2022 para soportar Top-level await de pdfjs-dist
    target: 'es2022',
    rollupOptions: {
        output: {
            manualChunks: {
                'pdf-libs': ['pdf-lib', 'pdfjs-dist'],
                'react-libs': ['react', 'react-dom']
            }
        }
    }
  }
})