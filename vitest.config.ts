// NOTE: intentionally excluded from tsconfig (tsc) — vitest bundles its own vite
// whose Plugin types differ from the project's, which only trips up tsc, not the
// esbuild-based runtime. Vitest loads this file directly at test time.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
