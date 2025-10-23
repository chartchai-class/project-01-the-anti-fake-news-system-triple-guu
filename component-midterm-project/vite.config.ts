import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwind from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //vueDevTools(),
    tailwind(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // dev server proxy: forward /api requests to backend at :8080 when developing
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
    },
  },
})
