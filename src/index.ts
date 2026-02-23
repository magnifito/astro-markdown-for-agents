import type { AstroIntegration } from 'astro';

export interface MarkdownForAgentsOptions {
  /**
   * Additional User-Agent substrings to recognise as AI agents.
   * These are appended to the built-in list in `src/utils.ts`.
   *
   * @example
   * markdownForAgents({ additionalAgents: ['MyCustomBot'] })
   */
  additionalAgents?: string[];
}

/**
 * Astro integration: `astro-markdown-for-agents`
 *
 * Adds middleware that detects AI-agent requests and automatically returns
 * a Markdown version of the page — no Cloudflare paid plan required.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config';
 * import cloudflare from '@astrojs/cloudflare';
 * import markdownForAgents from 'astro-markdown-for-agents';
 *
 * export default defineConfig({
 *   adapter: cloudflare(),
 *   integrations: [markdownForAgents()],
 * });
 * ```
 */
export function markdownForAgents(
  _options: MarkdownForAgentsOptions = {},
): AstroIntegration {
  return {
    name: 'astro-markdown-for-agents',
    hooks: {
      'astro:config:setup': ({ addMiddleware, logger }) => {
        logger.info('Registering markdown-for-agents middleware');
        addMiddleware({
          entrypoint: 'astro-markdown-for-agents/middleware',
          order: 'pre',
        });
      },
    },
  };
}

export default markdownForAgents;
