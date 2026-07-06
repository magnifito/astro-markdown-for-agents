---
title: Markdown for Agents in Astro: Runtime Negotiation and Static Delivery
published: false
description: Serve Astro pages as Markdown with content negotiation, generated .md files, and llms.txt.
tags: astro, ai, cloudflare, webdev
---

# Markdown for Agents in Astro: Runtime Negotiation and Static Delivery

AI agents can parse HTML, but browser pages contain presentation markup, navigation, footers, and scripts that consume context without improving the answer. Markdown keeps the semantic structure most documentation needs: headings, links, lists, quotes, and code.

Cloudflare formalized a useful delivery pattern with `Accept: text/markdown`. An agent requests Markdown at the original page URL; a browser continues receiving HTML.

Astro sites need two implementations because static and server-rendered output behave differently.

## Server-rendered Astro

Install the integration:

```bash
pnpm add @puralex/astro-markdown-for-agents
```

Add it beside your adapter:

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

Astro middleware can now inspect the request and convert HTML responses:

```bash
curl -H "Accept: text/markdown" https://example.com/docs
```

Non-HTML assets and normal browser requests remain unchanged.

## Static Astro

A static host cannot execute Astro middleware. Conversion must happen during the build:

```text
dist/
├── index.html
├── index.md
├── docs/index.html
├── docs/index.md
└── llms.txt
```

Agents can use explicit Markdown URLs. If same-URL negotiation matters, add a hosting-layer rule that rewrites Markdown requests to the generated file.

This distinction prevents a common deployment bug: documentation claims content negotiation works, but the static host always returns HTML.

## llms.txt

The integration writes an index of generated Markdown pages:

```js
markdownForAgents({
  siteTitle: 'Product Documentation',
  siteDescription: 'API, deployment, and operations guides.',
});
```

`llms.txt` is a discovery aid, not a ranking guarantee. Clear content, stable URLs, and correct metadata still matter.

## Verify output

Test content type and semantics:

```bash
curl -i https://example.com/docs
curl -i -H "Accept: text/markdown" https://example.com/docs
```

Review pages containing tables, code blocks, callouts, custom components, and nested lists. Payload reduction is useful only when essential content survives.

The live documentation build includes a measured input/output demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/

Source:

https://github.com/magnifito/astro-markdown-for-agents
