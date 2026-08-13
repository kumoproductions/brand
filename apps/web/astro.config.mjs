// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://brand.kumo.productions',
  integrations: [sitemap()],
  server: {
    // portless injects PORT/HOST; astro only reads them via config
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    host: process.env.HOST || false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
