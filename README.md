# Markdown for Agents for Astro

Serve clean Markdown and generate `llms.txt` from Astro sites—static or SSR, including Cloudflare Free.

[![npm version](https://img.shields.io/npm/v/%40puralex%2Fastro-markdown-for-agents)](https://www.npmjs.com/package/@puralex/astro-markdown-for-agents)
[![npm downloads](https://img.shields.io/npm/dm/%40puralex%2Fastro-markdown-for-agents)](https://www.npmjs.com/package/@puralex/astro-markdown-for-agents)
[![CI](https://github.com/magnifito/astro-markdown-for-agents/actions/workflows/ci.yml/badge.svg)](https://github.com/magnifito/astro-markdown-for-agents/actions/workflows/ci.yml)
[![Astro 4–7](https://img.shields.io/badge/Astro-4%E2%80%937-BC52EE)](https://astro.build)
[![GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-8cf2b0)](./LICENSE)

**[Documentation](https://magnifito.github.io/astro-markdown-for-agents/)** ·
**[Live converter demo](https://magnifito.github.io/astro-markdown-for-agents/demo/)** ·
**[Astro integration directory](https://astro.build/integrations/?search=markdown-for-agents)**

## What it does

- Returns `text/markdown` when a runtime request sends `Accept: text/markdown`.
- Generates a parallel `.md` file for every page in static builds.
- Generates `llms.txt` with links to machine-readable pages.
- Detects known AI crawler User-Agents, with custom-agent support.
- Preserves normal HTML, JSON, CSS, image, and browser responses.
- Runs on edge runtimes with zero runtime package dependencies.

## Install

```bash
pnpm add @puralex/astro-markdown-for-agents
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  integrations: [markdownForAgents()],
});
```

Run `astro build`. Output includes HTML, matching Markdown files, and `llms.txt`.

## Choose a delivery mode

| Astro deployment | Markdown delivery | Required setup |
|---|---|---|
| Server-rendered | Same URL via `Accept: text/markdown` | Astro server adapter |
| Static | Direct `.md` URLs generated at build | None |
| Static with same-URL negotiation | Generated `.md` files | Host/CDN rewrite |

Static hosts cannot run Astro middleware. GitHub Pages, for example, serves `/index.md` directly but does not inspect `Accept` headers.

### Runtime negotiation

Use server output and any compatible Astro adapter:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [markdownForAgents()],
});
```

```bash
# Markdown
curl -i -H "Accept: text/markdown" http://localhost:4321/

# Normal HTML
curl -i http://localhost:4321/
```

Runtime Markdown responses include:

```http
Content-Type: text/markdown; charset=utf-8
Vary: Accept, User-Agent
```

### Static output

For a normal static build:

```text
dist/
├── index.html
├── index.md
├── about/
│   ├── index.html
│   └── index.md
└── llms.txt
```

Agents can request `/index.md`, `/about/index.md`, or discover pages through `/llms.txt`.

## Configuration

```js
markdownForAgents({
  // Add custom User-Agent substrings.
  additionalAgents: ['MyInternalCrawler'],

  // Generate llms.txt during static builds. Default: true.
  generateLlmsTxt: true,

  // llms.txt metadata.
  siteTitle: 'Product Documentation',
  siteDescription: 'API, deployment, and operations guides.',
});
```

## Supported agents

Built-in matching includes:

- OpenAI: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`
- Anthropic: `anthropic-ai`, `Claude-Web`, `ClaudeBot`
- Perplexity: `PerplexityBot`, `Perplexity-User`
- Google, Apple, Amazon, Meta, Cohere, Common Crawl, and other known crawlers

Explicit `Accept: text/markdown` negotiation is preferred when the client supports it. User-Agent detection handles crawlers that do not send that header.

## Converter API

The zero-dependency converter is also available directly:

```ts
import { htmlToMarkdown } from '@puralex/astro-markdown-for-agents/html-to-markdown';

const markdown = htmlToMarkdown('<main><h1>Hello</h1><p>Clean output.</p></main>');
```

## Compatibility

| Astro | Node |
|---|---|
| 4–5 | Node 20+ |
| 6–7 | Node 22.12+ |

Package output is compiled JavaScript with TypeScript declarations. CI runs unit tests, real middleware integration tests, example builds, and package checks.

## Why not Cloudflare's managed feature?

Cloudflare's Markdown for Agents provides managed runtime conversion on Pro, Business, and Enterprise plans. This integration moves conversion into Astro:

- Server-rendered sites convert through Astro middleware.
- Static sites generate Markdown during the Astro build.
- Cloudflare Free users can use either mode without enabling the paid managed feature.

See the [Cloudflare Free setup guide](https://magnifito.github.io/astro-markdown-for-agents/guides/cloudflare-free-plan/).

## Development

```bash
pnpm install
pnpm check
pnpm test
pnpm --filter astro-markdown-for-agents-example build
pnpm docs:build
```

Current suite: 86 unit tests and 13 end-to-end middleware tests.

## Early adopter program

Running public Astro documentation? [Submit a pilot site](https://github.com/magnifito/astro-markdown-for-agents/issues/new?template=pilot.yml) for setup help, a payload review, and inclusion in the future “Used by” section.

No users or testimonials are displayed without permission.

## License

GPL-3.0. See [LICENSE](./LICENSE).
