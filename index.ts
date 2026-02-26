import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { htmlToMarkdown } from './src/html-to-markdown.ts';

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
          entrypoint: '@puralex/astro-markdown-for-agents/middleware',
          order: 'pre',
        });
      },
      'astro:build:done': async ({ dir, routes, pages, logger }) => {
        // Find all pages that generated an HTML file
        const htmlPages = pages.filter((page) => page.pathname.endsWith('/') || page.pathname.endsWith('.html') || !page.pathname.includes('.'));

        if (htmlPages.length === 0) return;

        logger.info(`Generating Markdown files for ${htmlPages.length} built pages`);

        let count = 0;
        for (const page of htmlPages) {
          try {
            // Find the location of the built HTML file for this page
            // The file name usually matches the pathname but can fall back to index.html
            // page.pathname is e.g. "", "about/", "blog/getting-started/"
            const cleanPath = page.pathname.replace(/^\/|\/$/g, '');
            const possiblePaths = [
              new URL(`./${cleanPath === '' ? 'index.html' : `${cleanPath}/index.html`}`, dir),
              new URL(`./${cleanPath === '' ? 'index.html' : `${cleanPath}.html`}`, dir),
            ];

            let htmlFilePath: URL | undefined;
            for (const path of possiblePaths) {
              try {
                const stat = await fs.stat(path);
                if (stat.isFile()) {
                  htmlFilePath = path;
                  break;
                }
              } catch {
                // ignore
              }
            }

            if (!htmlFilePath) continue;

            const htmlContent = await fs.readFile(htmlFilePath, 'utf-8');
            const markdownContent = htmlToMarkdown(htmlContent);

            // Calculate the output path for the Markdown file
            // e.g. /index.html -> /index.md, /about/index.html -> /about/index.md
            const mdFilePath = new URL(htmlFilePath.href.replace(/\.html$/, '.md'));

            await fs.writeFile(mdFilePath, markdownContent, 'utf-8');
            count++;
          } catch (err) {
            logger.error(`Failed to generate Markdown for ${page.pathname}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }

        logger.info(`Successfully generated ${count} Markdown files.`);
      },
    },
  };
}

export default markdownForAgents;
