// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import basicSsl from '@vitejs/plugin-basic-ssl';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://crischarles.com/',
  trailingSlash: 'never',
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/maintenance') &&
        !page.includes('/chat') &&
        !page.includes('/_image')
    })
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
