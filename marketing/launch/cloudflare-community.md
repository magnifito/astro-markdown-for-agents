# Cloudflare community

## Title

Markdown for Agents on Cloudflare Free with Astro

## Body

Astro users on Cloudflare Free can move Markdown conversion into their application or build:

1. Astro server output + Cloudflare adapter: middleware handles `Accept: text/markdown`.
2. Static Astro output: build creates parallel `.md` files and `llms.txt`.

Package has zero runtime dependencies and uses Web APIs in request middleware.

Guide:

https://magnifito.github.io/astro-markdown-for-agents/guides/cloudflare-free-plan/?utm_source=cloudflare-community&utm_medium=community&utm_campaign=launch-0-3

Source:

https://github.com/magnifito/astro-markdown-for-agents

Important cache note: static same-URL negotiation still requires a Worker or rewrite, and negotiated responses must vary by request headers.

Looking for Cloudflare Pages/Workers users willing to validate production cache behavior.
