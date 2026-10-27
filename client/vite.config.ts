import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_SITE_BASE_PATH || '/KWIS/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor';
            if (id.includes('/motion') || id.includes('framer-motion')) return 'motion';
            if (id.includes('/zod/')) return 'validation';
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          }
        },
      },
    },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:5000' } },
});
