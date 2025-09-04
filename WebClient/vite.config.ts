import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

// Corrige __dirname em ambiente ES Module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
