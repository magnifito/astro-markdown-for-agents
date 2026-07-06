# Launch announcement draft

## Short version

Markdown for Agents for Astro v0.3 is out as a release-ready integration for both server-rendered and static sites.

It does three things:

- negotiates `Accept: text/markdown` for SSR sites
- writes matching `.md` pages and `llms.txt` for static builds
- keeps the runtime dependency list at zero

Live demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=launch&utm_medium=post&utm_campaign=launch-0-3

Install:

```bash
pnpm add @puralex/astro-markdown-for-agents
```

Source:

https://github.com/magnifito/astro-markdown-for-agents

## Post copy

I shipped `@puralex/astro-markdown-for-agents` v0.3.

It gives Astro sites a practical Markdown delivery path for agents and retrieval tools:

- SSR sites can negotiate `Accept: text/markdown`
- static sites get matching `.md` pages during build
- builds also generate `llms.txt`
- the package has zero runtime dependencies
- the public docs site includes a measured HTML-to-Markdown demo

I kept the public claims narrow on purpose. Static hosting does not run middleware, so the package documents SSR negotiation and static delivery separately instead of pretending they are the same thing.

Demo:

https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=launch&utm_medium=post&utm_campaign=launch-0-3

Source:

https://github.com/magnifito/astro-markdown-for-agents

If you run Astro or Starlight docs and want to validate real content types, tables, code blocks, or custom components, I’m collecting pilot sites.

