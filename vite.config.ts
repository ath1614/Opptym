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
    // Force cache busting with git commit hash
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    // Add cache busting headers
    assetsInlineLimit: 0,
    sourcemap: false,
    // Disable minification to avoid terser dependency
    minify: false,
  },
  // Force cache busting for development
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
    __BUILD_VERSION__: JSON.stringify(`v1.0.1-${Date.now()}`),
  },
})
