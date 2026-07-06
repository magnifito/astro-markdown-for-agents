# Astro Discord post

I shipped `@puralex/astro-markdown-for-agents` v0.3 for Astro sites that want Markdown delivery for agents.

It handles two deployment modes:

- SSR: negotiate `Accept: text/markdown` at the original URL
- static: generate matching `.md` pages and `llms.txt` during build

Other details:

- zero runtime dependencies
- Astro 4–7 peer support
- docs include a measured HTML-to-Markdown demo

Demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=astro-discord&utm_medium=community&utm_campaign=launch-0-3

Source:

https://github.com/magnifito/astro-markdown-for-agents

If you run Astro or Starlight docs, I’m looking for a few real sites to test tables, code blocks, callouts, and custom components.
