import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@tweenjs/tween.js'],
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['canvas-confetti']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
