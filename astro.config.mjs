// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://brand.kumo.productions',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: { ja: 'ja', en: 'en' },
      },
    }),
  ],
  server: {
    // portless injects PORT/HOST; astro only reads them via config
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    host: process.env.HOST || false,
  },
});
