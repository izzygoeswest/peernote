import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,  // 🔍 allow Chrome DevTools to trace exact origin of errors
  },
  define: {
    'process.env': {},  // prevent "process is undefined" errors
  },
});
