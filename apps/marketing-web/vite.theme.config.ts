import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname, 'Demo/ThemeThreadStory'),
  base: '/demo/ThemeThreadStory/',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, 'public/demo/ThemeThreadStory'),
    emptyOutDir: false,
    rollupOptions: { output: { entryFileNames: 'theme.js', chunkFileNames: '[name].js', assetFileNames: '[name][extname]' } },
  },
});
