import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: './',
  base: '/',
  server: {
    // Run Vite dev server on a different port than the API to avoid collisions
    port: 3000,
    proxy: {
      // Forward API calls to the backend running on port 3000
      '/api': {
        target: 'http://192.168.18.64:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
