import path from 'node:path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte(), devtoolsJson()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './src/lib')
    }
  }
});
