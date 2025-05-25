import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), UnoCSS()],
  server: {
    host: '0.0.0.0',
    port: 5678,
    proxy: {
      '/ninja_api': {
        target: 'http://localhost:11894',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ninja_api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
