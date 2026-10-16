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
  trailingSlash: 'never',
  output: 'server',
  adapter: vercel(),
  redirects: {
    '/projects/tis-record-management-system': '/projects/tis-rms',
    '/projects/tis-rms/': '/projects/tis-rms'
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/maintenance') &&
        !page.includes('/chat') &&
        !page.includes('/_image'),
      serialize(item) {
        if (item.url === 'https://crischarles.com' || item.url === 'https://crischarles.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/projects')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      }
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
