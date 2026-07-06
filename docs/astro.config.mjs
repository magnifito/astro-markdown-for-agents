// @ts-check
import { defineConfig } from 'astro/config';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

// https://astro.build/config
export default defineConfig({
  site: 'https://magnifito.github.io',
  base: '/astro-markdown-for-agents/',
  integrations: [
    markdownForAgents({
      generateLlmsTxt: true,
      siteTitle: 'Astro Markdown for Agents',
      siteDescription: 'Documentation site for the astro-markdown-for-agents plugin'
    })
  ]
});
