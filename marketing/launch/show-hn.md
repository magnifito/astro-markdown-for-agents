# Show HN

## Title

Show HN: Markdown for Agents for Astro (static pages, SSR negotiation, llms.txt)

## Body

I built an Astro integration that exposes rendered pages as cleaner Markdown for agents and retrieval tools.

For server-rendered Astro sites, it uses standard HTTP content negotiation:

```bash
curl -H "Accept: text/markdown" https://example.com/docs
```

For static sites, it writes a matching `.md` file per generated HTML page and creates `llms.txt`. This keeps GitHub Pages and other static hosts useful without pretending they can run request middleware.

The converter has zero runtime dependencies. Package ships compiled ESM and TypeScript declarations. Current suite contains 99 automated tests, including 13 real middleware tests.

Live measured demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=hacker-news&utm_medium=community&utm_campaign=launch-0-3

Source:

https://github.com/magnifito/astro-markdown-for-agents

Interested in HTML patterns that produce poor Markdown—especially docs tables, custom elements, and MDX components.
