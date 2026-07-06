# astro-markdown-for-agents

An Astro integration that automatically serves **Markdown** to AI agents — including on Cloudflare's **free plan**.

Cloudflare's built-in [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) feature (launched February 2026) converts HTML pages to Markdown when AI agents request them, significantly reducing token usage. However, it requires a paid Cloudflare plan. This integration replicates that behaviour inside Astro's middleware layer, so any Astro site can benefit regardless of hosting plan.

## How It Works

When a request arrives with either:

- an `Accept: text/markdown` header, or
- a `User-Agent` that matches a known AI crawler (GPTBot, ClaudeBot, PerplexityBot, etc.)

…the middleware intercepts the normal HTML response, converts it to clean Markdown, and returns it with `Content-Type: text/markdown`.

All other requests are passed through unchanged.

## Installation

```bash
npm install astro-markdown-for-agents
```

## Usage

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import markdownForAgents from 'astro-markdown-for-agents';

export default defineConfig({
  adapter: cloudflare(),
  integrations: [markdownForAgents()],
});
```

The integration works with any Astro adapter, not just Cloudflare.

## Configuration

You can optionally configure the integration:

```js
export default defineConfig({
  integrations: [
    markdownForAgents({
      // Add custom User-Agent strings to detect
      additionalAgents: ['MyCustomBot'],
      
      // Disable automatic llms.txt generation during build (enabled by default)
      generateLlmsTxt: false,
      
      // Customise the llms.txt header
      siteTitle: 'My Project Docs',
      siteDescription: 'Documentation tailored for AI agents.'
    })
  ],
});
```

### Automatic `llms.txt` Generation

During static builds (`astro build`), this integration automatically generates an [`llms.txt` file](https://llmstxt.org/) at the root of your output directory. This file acts as a standard map for AI agents, listing all the generated Markdown versions of your pages.

## Testing

```bash
# Should return text/markdown
curl -H "Accept: text/markdown" http://localhost:4321/

# Should return normal HTML
curl http://localhost:4321/

# Simulate a known AI crawler
curl -H "User-Agent: GPTBot/1.0" http://localhost:4321/
```

## Token Savings

Serving Markdown instead of HTML dramatically reduces the number of tokens an AI model needs to process. For example, a typical documentation page:

| Format   | Tokens  |
|----------|---------|
| HTML     | ~16,000 |
| Markdown | ~3,100  |

That is roughly an **80% reduction**.

## Supported AI Agents

The following User-Agent strings are detected out of the box:

- `anthropic-ai` / `Claude-Web` / `ClaudeBot`
- `GPTBot` / `ChatGPT-User` / `OAI-SearchBot`
- `Google-Extended`
- `cohere-ai`
- `PerplexityBot` / `Perplexity-User`
- `YouBot`
- `Applebot-Extended`
- `Amazonbot`
- `Meta-ExternalAgent`
- `Bytespider`, `CCBot`, `DataForSeoBot`, `FacebookBot`, `facebookexternalhit`
- `ImagesiftBot`, `Omgilibot`, `Omgili`, `PiplBot`, `Seekr`
- `Timpibot`, `VelenPublicWebCrawler`, `WebzIO-Extended`

Any request sending `Accept: text/markdown` is also matched, regardless of User-Agent.

## Edge Runtime Compatibility

The converter is implemented with pure regex — no DOM, no Node.js APIs. It runs natively in Cloudflare Workers, Deno Deploy, and any other edge runtime.

## License

GPL-3.0 — see [LICENSE](./LICENSE).
