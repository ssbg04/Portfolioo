// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

import basicSsl from '@vitejs/plugin-basic-ssl';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://crischarles.com',
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap()
  ],

  vite: {
    plugins: [tailwindcss(), basicSsl()],
    server: {
      https: true
    },
    build: {
      cssMinify: 'esbuild'
    }
  }
});
