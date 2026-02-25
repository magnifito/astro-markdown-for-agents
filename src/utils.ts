/**
 * Known AI agent User-Agent strings.
 * Based on Cloudflare's "Markdown for Agents" bot list and common crawlers.
 * https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */
export const AI_USER_AGENTS: readonly string[] = [
  'anthropic-ai',
  'Claude-Web',
  'ClaudeBot',
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'cohere-ai',
  'PerplexityBot',
  'YouBot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'DataForSeoBot',
  'FacebookBot',
  'facebookexternalhit',
  'ImagesiftBot',
  'Omgilibot',
  'Omgili',
  'PiplBot',
  'Seekr',
  'Timpibot',
  'VelenPublicWebCrawler',
  'WebzIO-Extended',
];

/**
 * Returns true if the incoming request appears to come from an AI agent.
 *
 * Detection order:
 * 1. `Accept` header includes `text/markdown` (explicit agent opt-in)
 * 2. `User-Agent` matches a known AI crawler or a caller-supplied agent string
 *
 * @param request       The incoming HTTP request.
 * @param extraAgents   Additional User-Agent substrings to match (from integration options).
 */
export function isAgentRequest(request: Request, extraAgents: string[] = []): boolean {
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/markdown')) {
    return true;
  }

  const ua = (request.headers.get('user-agent') ?? '').toLowerCase();
  const allAgents = extraAgents.length > 0 ? [...AI_USER_AGENTS, ...extraAgents] : AI_USER_AGENTS;
  return allAgents.some((agent) => ua.includes(agent.toLowerCase()));
}
