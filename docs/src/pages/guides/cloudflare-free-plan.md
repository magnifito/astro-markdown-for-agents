---
layout: ../../layouts/Layout.astro
title: Cloudflare Markdown for Agents on the Free Plan with Astro
description: Serve Astro pages as Markdown on Cloudflare Free using runtime middleware or generated static files.
article: true
---

<main id="main-content" class="article">

# Cloudflare Markdown for Agents on the Free Plan

Cloudflare offers managed HTML-to-Markdown conversion through its Markdown for Agents feature. Cloudflare documents that feature for Pro, Business, and Enterprise plans. Astro projects on the Free plan can implement the same delivery pattern at the application or build layer.

`@puralex/astro-markdown-for-agents` provides two options.

## Option 1: Cloudflare Workers runtime

Use Astro server output with the Cloudflare adapter. Middleware inspects the request and converts HTML responses when Markdown is requested.

```bash
pnpm add @astrojs/cloudflare @puralex/astro-markdown-for-agents
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [markdownForAgents()],
});
```

Verify locally and after deployment:

```bash
curl -i \
  -H "Accept: text/markdown" \
  https://example.com/docs
```

The middleware uses Web APIs and has no runtime package dependencies. The converter does not require a browser DOM.

## Option 2: Static Pages output

For a fully static Astro site, keep normal static output:

```js
import { defineConfig } from 'astro/config';
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  integrations: [markdownForAgents()],
});
```

The build produces HTML and Markdown variants:

```text
/docs/index.html
/docs/index.md
/llms.txt
```

Agents can consume explicit Markdown URLs. Header-based content negotiation needs a Cloudflare rule or Worker that rewrites Markdown requests to the matching `.md` file.

## Cache behavior

Negotiated HTML and Markdown share a URL, so caches must distinguish them. Runtime responses include a `Vary` header. When adding custom Cloudflare caching or transformations, verify that a Markdown response cannot be cached and served to browsers.

Test both directions after every cache change:

```bash
# Must remain HTML
curl -sI https://example.com/docs

# Must be Markdown
curl -sI -H "Accept: text/markdown" https://example.com/docs
```

## Which option should you use?

Choose runtime middleware when:

- Your Astro site already uses server output.
- Same-URL content negotiation matters.
- Pages contain runtime or personalized content.

Choose generated Markdown when:

- Your site is fully static.
- Lowest operational complexity matters.
- Explicit `.md` URLs work for your agents or retrieval pipeline.

Both approaches avoid requiring Cloudflare's managed paid-plan conversion.

## Related guides

- [Complete Astro setup](../astro-markdown-for-agents/)
- [Generate llms.txt in Astro](../astro-llms-txt/)
- [Live static Markdown demo](../../demo/)

</main>
