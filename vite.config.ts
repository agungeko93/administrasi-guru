import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base './' memastikan seluruh aset CSS/JS tidak 404 pada sub-path GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
