# Documentation site

Marketing site and implementation guides for `@puralex/astro-markdown-for-agents`.

Run from repository root:

```bash
pnpm install
pnpm docs:build
pnpm --filter astro-markdown-for-agents-docs dev
```

GitHub Pages deployment runs through `.github/workflows/deploy-docs.yml`.

Optional privacy-friendly analytics:

```bash
PUBLIC_PLAUSIBLE_DOMAIN=example.com pnpm docs:build
```

No analytics script is emitted unless `PUBLIC_PLAUSIBLE_DOMAIN` is set.
