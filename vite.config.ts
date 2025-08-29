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
    // Production optimizations
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
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
  // Force cache busting for development
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
    __BUILD_VERSION__: JSON.stringify(`v1.0.1-${Date.now()}`),
  },
})
