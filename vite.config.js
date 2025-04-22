// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,       // generate source maps
    rollupOptions: {
      output: {
        // this banner is prepended to every chunk
        banner: `
/** ⚠️ Polyfill to prevent 3rd‑party libs from crashing on undefined.match() */
;(function() {
  const orig = String.prototype.match;
  String.prototype.match = function(...args) {
    if (typeof this !== 'string') {
      console.warn('Skipping .match() on non-string:', this);
      return null;
    }
    return orig.apply(this, args);
  };
})();
        `.trim(),
      }
    }
  },
  define: {
    'process.env': {},     // avoid process is undefined in some libs
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
