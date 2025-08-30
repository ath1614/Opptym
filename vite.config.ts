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
    // Production optimizations with enhanced cache busting
    rollupOptions: {
      output: {
        // Add timestamp to all file names for aggressive cache busting
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'antd']
        }
      }
    },
    // Performance optimizations
    assetsInlineLimit: 4096, // Inline small assets
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Force cache busting for development and production
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
    __BUILD_VERSION__: JSON.stringify(`v1.0.2-${Date.now()}`),
    __CACHE_BUST__: JSON.stringify(`cb-${Date.now()}`),
  },
  // Add cache control headers
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
