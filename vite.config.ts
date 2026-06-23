import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built site works both locally (preview) and when served
// from a project sub-path (e.g. GitHub Pages). There is no client-side router.
export default defineConfig({
  base: './',
  plugins: [react()],
});
