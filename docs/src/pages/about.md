---
layout: ../layouts/Layout.astro
title: About the Project
---

# About Astro Markdown for Agents

Welcome to the **About** page! This page is written entirely in Markdown, which means when an AI agent requests this page with `Accept: text/markdown`, it receives this exact raw markdown content instead of the parsed HTML.

## Why This Matters

1. **Efficiency**: AI agents (like Claude, ChatGPT, Perplexity) process Markdown faster and more accurately than nested HTML.
2. **Cost Savings**: If you run your own crawler or process web pages using LLMs, you pay by the token. By removing HTML boilerplate, you save up to 80% on tokens.
3. **Accuracy**: You eliminate the risk of an LLM incorrectly parsing complex HTML, nested divs, and hidden navigation elements. 

## Integration Details

The `astro-markdown-for-agents` plugin uses an Astro Middleware to intercept incoming requests and checks either:
- The `Accept` header for `text/markdown`.
- The `User-Agent` to see if it matches a known crawler (like `GPTBot`, `ClaudeBot`, `Amazonbot`, etc.).

If either matches, the plugin bypasses the final HTML rendering step and serves the raw markdown source of the page!

```typescript
// It's this simple:
import markdownForAgents from '@puralex/astro-markdown-for-agents';

export default defineConfig({
  integrations: [markdownForAgents()]
});
```

Enjoy building for the Agentic Era!
