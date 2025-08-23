import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": '/src',
    },
  },
  build: {
    // Force cache busting
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    },
    // Add cache busting headers
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  // Force cache busting for development
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
  },
})
