import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['opptym.com', 'www.opptym.com', 'localhost'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['opptym.com', 'www.opptym.com', 'localhost'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(Date.now()), // Force cache busting
  }
});
