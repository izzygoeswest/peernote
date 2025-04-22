import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // This banner runs *before* any of your app or 3rd‑party code
        banner: `
/** ⚠️ Prevent .match() crashes in 3rd‑party libs **/
;(function() {
  const orig = String.prototype.match;
  String.prototype.match = function(...args) {
    if (typeof this !== 'string') {
      return null;
    }
    return orig.apply(this, args);
  };
})();
        `.trim()
      }
    }
  },
  define: {
    'process.env': {},   // avoid missing‐process errors
  },
});
