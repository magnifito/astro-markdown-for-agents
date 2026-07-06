---
layout: ../../layouts/Layout.astro
title: Generate llms.txt in Astro Automatically
description: Generate llms.txt and matching Markdown pages from an Astro build for AI agents and retrieval tools.
article: true
---

<main id="main-content" class="article">

# Generate `llms.txt` in Astro

An `llms.txt` file gives agents a concise map of machine-readable pages. It does not replace a sitemap, robots policy, or good documentation. It complements them by pointing directly to useful Markdown representations.

The Markdown for Agents integration generates `llms.txt` during `astro build`.

## Basic configuration

```bash
pnpm add @puralex/astro-markdown-for-agents
```

```js
import { defineConfig } from 'astro/config';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  integrations: [
    markdownForAgents({
      siteTitle: 'Acme API Documentation',
      siteDescription: 'API guides, references, and deployment documentation.',
    }),
  ],
});
```

Build your site:

```bash
pnpm astro build
```

Generated output resembles:

```md
# Acme API Documentation
> API guides, references, and deployment documentation.

## Pages
- [/](./index.md)
- [docs/](/docs/index.md)
- [api/authentication/](/api/authentication/index.md)
```

The integration respects Astro's configured `base` path, which matters for GitHub Pages and subdirectory deployments.

## Disable generation

If another tool owns `llms.txt`, disable this feature:

```js
markdownForAgents({
  generateLlmsTxt: false,
});
```

## What should appear in llms.txt?

Include pages that help an agent answer questions or perform tasks:

- Product and API documentation
- Installation and migration guides
- Concepts and architecture
- Troubleshooting references
- Changelogs with stable URLs

Exclude low-value or sensitive surfaces:

- Authentication callbacks
- Account pages
- Search result pages
- Duplicate tag archives
- Preview and staging routes

Current generation follows built Astro pages. Review the file during CI before publishing.

## Validate links

After deployment:

```bash
curl -fsS https://example.com/llms.txt
curl -fsS https://example.com/docs/index.md
```

For a site deployed below a base path:

```bash
curl -fsS https://example.github.io/project/llms.txt
```

Automate link validation in CI if documentation routes change frequently.

## Discovery beyond llms.txt

Also consider:

- A normal XML sitemap for search engines.
- `<link rel="alternate" type="text/markdown">` in HTML pages.
- Canonical URLs and accurate page metadata.
- Direct Markdown links in developer documentation.

`llms.txt` improves discovery. Clean, accurate content determines usefulness.

## Related guides

- [Markdown for Agents with Astro](../astro-markdown-for-agents/)
- [Cloudflare Free Plan setup](../cloudflare-free-plan/)
- [Astro Starlight and text/markdown](../starlight-text-markdown/)

</main>
