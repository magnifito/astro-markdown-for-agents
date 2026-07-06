# Reddit r/astrojs

## Title

I built Markdown for Agents for Astro—runtime negotiation, static .md pages, and llms.txt

## Body

Cloudflare's managed Markdown for Agents feature gave me a useful target: an agent sends `Accept: text/markdown`, and the site returns clean Markdown instead of browser-oriented HTML.

I built the same delivery pattern inside Astro:

- SSR sites negotiate through Astro middleware.
- Static builds generate a matching `.md` file per page.
- Builds also generate `llms.txt`.
- Browser and non-HTML responses pass through unchanged.
- Converter has no runtime dependencies.

One distinction I wanted to document honestly: static hosting does not execute middleware. On GitHub Pages, agents use explicit `.md` URLs unless the host adds a rewrite. Same-URL negotiation requires a server adapter or edge rule.

Install:

```bash
pnpm add @puralex/astro-markdown-for-agents
```

Measured demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=reddit&utm_medium=community&utm_campaign=launch-0-3

Source:

https://github.com/magnifito/astro-markdown-for-agents

I am looking for real Starlight and Astro documentation pages that stress tables, code blocks, callouts, and custom components. Conversion examples and criticism welcome.
