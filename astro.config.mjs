// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import basicSsl from '@vitejs/plugin-basic-ssl';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss(), basicSsl()],
    server: {
      https: true
    },
    build: {
      cssMinify: 'esbuild'
    }
  },

  adapter: vercel()
});
