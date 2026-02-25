import type { MiddlewareHandler } from 'astro';
import { isAgentRequest } from './utils.ts';
import { htmlToMarkdown } from './html-to-markdown.ts';

// Resolved at build/dev time by the Vite plugin registered in `src/index.ts`.
// Falls back to an empty array when the virtual module is absent (e.g. in tests).
let extraAgents: string[] = [];
try {
  // @ts-expect-error – virtual module, not visible to tsc
  const config = await import('virtual:astro-markdown-for-agents/config');
  extraAgents = config.additionalAgents ?? [];
} catch {
  // Running outside of an Astro build/dev context (e.g. unit tests).
}

/**
 * Astro middleware that intercepts requests from AI agents and returns
 * a Markdown version of the page instead of raw HTML.
 *
 * Triggered when:
 *   - The `Accept` header includes `text/markdown`, OR
 *   - The `User-Agent` matches a known AI crawler (or a user-supplied one)
 *
 * Compatible with Cloudflare Workers (edge runtime) — no Node.js APIs used.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  // Pass non-agent requests straight through.
  if (!isAgentRequest(context.request, extraAgents)) {
    return next();
  }

  const response = await next();

  // Only convert HTML responses; leave JSON, images, etc. untouched.
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html);

  return new Response(markdown, {
    status: response.status,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'x-original-content-type': contentType,
    },
  });
};
