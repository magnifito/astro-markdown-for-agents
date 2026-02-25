# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-02-24

### Added

- Astro integration (`markdownForAgents()`) that registers middleware via
  `astro:config:setup`, compatible with Astro v4 and v5.
- Middleware intercepts requests from AI agents and returns a Markdown version
  of the HTML page instead of raw HTML.
- Agent detection by `Accept: text/markdown` header or `User-Agent` match
  against a built-in list of known AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, and many others).
- `additionalAgents` option to extend the built-in agent list with custom
  User-Agent substrings.
- HTML-to-Markdown converter implemented with pure regex — no DOM or Node.js
  APIs — for full compatibility with Cloudflare Workers and other edge runtimes.
- Vite virtual module (`virtual:astro-markdown-for-agents/config`) to pass
  integration options to the middleware at both dev and build time.
- `examples/basic` — minimal Astro site using `@astrojs/node` that demonstrates
  the integration working end-to-end.
- 65 unit tests (Vitest) covering agent detection and HTML-to-Markdown conversion.
- GitHub Actions CI: build and test matrix across Node 18, 20, 22; example
  build verified as a separate job.
