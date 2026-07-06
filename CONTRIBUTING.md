# Contributing

## Setup

```bash
pnpm install
pnpm check
pnpm test
```

Build the example and documentation:

```bash
pnpm --filter astro-markdown-for-agents-example build
pnpm docs:build
```

## Pull requests

- Keep changes focused.
- Add or update tests for behavior changes.
- Preserve normal browser and non-HTML responses.
- Document differences between static output and runtime negotiation.
- Do not add runtime dependencies without explaining edge-runtime impact.

## Reporting conversion problems

Include:

- Minimal HTML input
- Actual Markdown output
- Expected Markdown output
- Astro, adapter, and Node versions

Remove private content before posting fixtures.
