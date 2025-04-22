import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // 🔍 enable source maps for debugging
  },
  define: {
    'process.env': {}, // 👈 prevent undefined errors in some packages
  },
});
