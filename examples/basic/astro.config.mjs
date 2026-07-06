import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    markdownForAgents({
      // Uncomment to add custom bots on top of the built-in list:
      // additionalAgents: ['MyInternalBot'],
    }),
  ],
});
