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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('tween')) {
              return 'three'
            }
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor'
            }
            if (id.includes('confetti')) {
              return 'ui'
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
