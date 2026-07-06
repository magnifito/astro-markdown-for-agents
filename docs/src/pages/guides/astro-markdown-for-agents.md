---
layout: ../../layouts/Layout.astro
title: Markdown for Agents with Astro — Complete Setup Guide
description: Install and configure Markdown content negotiation, static .md pages, and llms.txt in Astro.
article: true
---

<main id="main-content" class="article">

# Markdown for Agents with Astro

Astro produces lean HTML, but an AI agent still has to process navigation, layout markup, styles, and other browser-oriented structure. A Markdown representation keeps headings, links, lists, code, and meaningful text while removing most presentation noise.

`@puralex/astro-markdown-for-agents` supports two delivery modes:

1. Runtime content negotiation for server-rendered Astro sites.
2. Generated `.md` files for static Astro builds.

Both modes can be enabled by the same integration.

## Install

```bash
pnpm add @puralex/astro-markdown-for-agents
```

Register it in `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  integrations: [markdownForAgents()],
});
```

Run `astro build`. Alongside normal HTML output, the integration creates Markdown files and an `llms.txt` index.

## Runtime content negotiation

Runtime negotiation requires server-rendered output and an Astro adapter:

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [markdownForAgents()],
});
```

Test the response:

```bash
curl -i -H "Accept: text/markdown" http://localhost:4321/
```

Expected header:

```http
Content-Type: text/markdown; charset=utf-8
Vary: Accept, User-Agent
```

A normal request still returns HTML:

```bash
curl -i http://localhost:4321/
```

## Static Astro sites

Static hosts cannot execute Astro middleware at request time. During `astro build`, the integration therefore writes a parallel Markdown file for every generated HTML page:

```text
dist/
├── index.html
├── index.md
├── about/
│   ├── index.html
│   └── index.md
└── llms.txt
```

Agents can request `/index.md` or `/about/index.md` directly. If your hosting platform supports header-based rewrites, map Markdown requests to those generated files at the edge.

Do not claim that a static host performs content negotiation unless that rewrite exists. GitHub Pages, for example, serves generated Markdown URLs but does not inspect `Accept` headers.

## Configuration

```js
markdownForAgents({
  additionalAgents: ['MyInternalCrawler'],
  generateLlmsTxt: true,
  siteTitle: 'Product Documentation',
  siteDescription: 'Machine-readable product and API documentation.',
});
```

`Accept: text/markdown` is the interoperable path. User-Agent matching exists for crawlers that do not send that header. Add custom agents only when you control or understand their behavior.

## Verify before deployment

Use this checklist:

- Browser request returns HTML.
- Markdown request returns `text/markdown`.
- JSON, CSS, images, and downloads pass through unchanged.
- Generated Markdown removes navigation and footer noise.
- Code blocks, links, lists, and headings remain readable.
- `llms.txt` links resolve under your configured Astro `base`.
- CDN cache keys vary on negotiated headers.

## Next steps

- [Cloudflare Free Plan setup](../cloudflare-free-plan/)
- [Generate llms.txt in Astro](../astro-llms-txt/)
- [Astro Starlight and text/markdown](../starlight-text-markdown/)
- [Inspect the live converter demo](../../demo/)

</main>
