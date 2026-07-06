// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

// https://astro.build/config
export default defineConfig({
  site: 'https://magnifito.github.io',
  base: '/astro-markdown-for-agents/',
  integrations: [
    sitemap(),
    markdownForAgents({
      generateLlmsTxt: true,
      siteTitle: 'Astro Markdown for Agents',
      siteDescription: 'Serve clean Markdown and llms.txt from Astro sites.'
    })
  ]
});
