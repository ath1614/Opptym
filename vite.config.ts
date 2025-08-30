import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get build-time variables
const BUILD_TIME = new Date().toISOString()
const COMMIT_SHA = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
const VERSION = process.env.npm_package_version || '1.0.0'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_VERSION__: JSON.stringify(`v${VERSION}-${Date.now()}`),
    __CACHE_BUST__: JSON.stringify(Date.now()),
    __TIMESTAMP__: JSON.stringify(BUILD_TIME),
    __COMMIT_SHA__: JSON.stringify(COMMIT_SHA),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME)
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-${Date.now()}.[ext]`
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
