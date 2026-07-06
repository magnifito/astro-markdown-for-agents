---
layout: ../layouts/Layout.astro
title: About Markdown for Agents for Astro
description: Project goals, delivery model, and current scope.
article: true
---

<main id="main-content" class="article">

# About the project

Markdown for Agents for Astro is an open-source Astro integration maintained at [`magnifito/astro-markdown-for-agents`](https://github.com/magnifito/astro-markdown-for-agents).

It solves one bounded problem: expose rendered Astro content in a cleaner representation for agents, crawlers, and retrieval pipelines.

## Current scope

- Runtime `Accept: text/markdown` negotiation for server-rendered sites.
- Optional AI User-Agent detection.
- Static `.md` generation during Astro builds.
- Automatic `llms.txt` generation.
- Edge-compatible HTML-to-Markdown conversion.
- No runtime package dependencies.

## Delivery model

Runtime Astro adapters can inspect request headers and return Markdown at the original URL. Static hosting cannot run middleware, so static builds publish direct `.md` URLs instead. Host-level rewrites remain optional and platform-specific.

The project does not claim that Markdown automatically improves search ranking or agent citations. It provides cleaner transport and discovery; content quality still matters.

## License

Project source is available under GPL-3.0.

</main>
