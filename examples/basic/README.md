# astro-markdown-for-agents — basic example

A minimal Astro site that shows the `astro-markdown-for-agents` integration in action.
It uses the `@astrojs/node` adapter so the middleware runs both in `astro dev` and in
the production server.

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:4321/> in a browser for the normal HTML version, or test the
Markdown response that AI agents receive:

```bash
# Explicit opt-in via Accept header
curl -H "Accept: text/markdown" http://localhost:4321/

# Simulates GPT / ChatGPT crawler
curl -H "User-Agent: GPTBot/1.1" http://localhost:4321/

# Simulates Claude crawler
curl -H "User-Agent: ClaudeBot/1.0" http://localhost:4321/

# Try any page
curl -H "Accept: text/markdown" http://localhost:4321/about
curl -H "Accept: text/markdown" http://localhost:4321/blog/getting-started
```

## Building for production

```bash
npm run build      # produces dist/ with a Node.js standalone server
node dist/server/entry.mjs
```

## Swapping the adapter

Edit `astro.config.mjs` and replace the `@astrojs/node` adapter with the one for your
deployment target:

| Platform | Adapter |
|---|---|
| Cloudflare Workers / Pages | `@astrojs/cloudflare` |
| Vercel | `@astrojs/vercel` |
| Deno Deploy | `@astrojs/deno` |
| Generic Node.js server | `@astrojs/node` (already set) |
