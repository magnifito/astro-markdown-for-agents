import { defineConfig } from 'astro/config';
import markdownForAgents from 'astro-markdown-for-agents';

export default defineConfig({
  // output: 'server' is required for the middleware to run at request time in
  // production. Swap the adapter for your deployment target:
  //   Cloudflare Workers/Pages → @astrojs/cloudflare
  //   Deno Deploy             → @astrojs/deno
  //   Vercel                  → @astrojs/vercel
  output: 'static',
  integrations: [
    markdownForAgents({
      // Uncomment to add custom bots on top of the built-in list:
      // additionalAgents: ['MyInternalBot'],
    }),
  ],
});
