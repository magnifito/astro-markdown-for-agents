# Short posts

## Release

Markdown for Agents for Astro v0.3:

→ `Accept: text/markdown` for SSR  
→ generated `.md` pages for static sites  
→ automatic `llms.txt`  
→ zero runtime dependencies  
→ Astro 4–7

Measured demo: https://magnifito.github.io/astro-markdown-for-agents/demo/?utm_source=social&utm_medium=organic&utm_campaign=launch-0-3

`pnpm add @puralex/astro-markdown-for-agents`

## Pilot request

Running Astro or Starlight docs?

Looking for ten public sites to test Markdown delivery, code blocks, tables, and custom components. Setup help + payload review included.

Apply: https://github.com/magnifito/astro-markdown-for-agents/issues/new?template=pilot.yml

## Technical hook

Static Astro site ≠ runtime content negotiation.

Correct pattern:

- SSR adapter: negotiate at original URL.
- Static host: generate `.md` files.
- Optional edge rewrite: map `Accept: text/markdown` to static Markdown.

Guide: https://magnifito.github.io/astro-markdown-for-agents/guides/astro-markdown-for-agents/
