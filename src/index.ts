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

/** Virtual module ID used to pass resolved options to the middleware. */
const VIRTUAL_MODULE_ID = 'virtual:astro-markdown-for-agents/config';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

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
  options: MarkdownForAgentsOptions = {},
): AstroIntegration {
  const { additionalAgents = [] } = options;

  return {
    name: 'astro-markdown-for-agents',
    hooks: {
      'astro:config:setup': ({ addMiddleware, updateConfig, logger }) => {
        logger.info('Registering markdown-for-agents middleware');

        // Expose resolved options to the middleware via a virtual module so
        // that `additionalAgents` is available at both dev and build time.
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'vite-plugin-astro-markdown-for-agents',
                resolveId(id) {
                  if (id === VIRTUAL_MODULE_ID) {
                    return RESOLVED_VIRTUAL_MODULE_ID;
                  }
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) {
                    return `export const additionalAgents = ${JSON.stringify(additionalAgents)};`;
                  }
                },
              },
            ],
          },
        });

        addMiddleware({
          entrypoint: 'astro-markdown-for-agents/middleware',
          order: 'pre',
        });
      },
    },
  };
}

export default markdownForAgents;
