import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* to the burnd CLI server in dev mode so the dashboard
      // can fetch from /api/snapshot without CORS or absolute URLs.
      // In production (when served by `burnd serve`), the dashboard and
      // the API are on the same origin, so this proxy is dev-only.
      '/api': {
        target: 'http://localhost:4711',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          motion: ['motion'],
          // recharts intentionally omitted — it has a circular dep with r3f when forced into a
          // shared chunk. Vite/Rollup naturally co-locates it with the app route chunks that use it.
        },
      },
    },
  },
});
