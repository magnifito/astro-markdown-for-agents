# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-07-06

### Added

- Astro 7 support.
- Automatic `llms.txt` generation with site title and description options.
- Additional OpenAI, Perplexity, Amazon, and Meta crawler identifiers.
- Compiled ESM package output and TypeScript declarations.
- Public HTML-to-Markdown converter export.
- Documentation site, measured demo, deployment guides, and pilot program.

### Changed

- Static and runtime delivery modes are documented separately.
- Generated `llms.txt` links respect Astro's configured base path.
- Package discovery metadata now includes Markdown for Agents, content
  negotiation, Starlight, and HTML-to-Markdown terms.
- Minimum Node version is 20; Astro 6 and 7 still require Node 22.12 or newer.

### Fixed

- Correct scoped npm installation and import commands throughout documentation.
- Re-enabled and repaired the Astro 7 end-to-end integration suite.
- Added the missing package build step used by CI and publishing workflows.

## [0.2.0] — 2026-03-19

### Added

- Astro 6 compatibility.
- npm release workflow.

### Changed

- Minimum Node version aligned with Astro 6 for the published 0.2 release.

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
- GitHub Actions CI with package and example build verification.
