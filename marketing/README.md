# Marketing operating kit

This directory contains launch copy, outreach research, metrics, and campaign sequencing for `@puralex/astro-markdown-for-agents`.

## Release gate

Do not distribute until:

- `pnpm check`
- `pnpm test`
- `pnpm docs:build`
- `pnpm --filter astro-markdown-for-agents-example build`
- `npm pack --dry-run`
- Documentation deployment verified
- npm `0.3.0` verified

## Order

1. Merge and deploy documentation.
2. Publish npm release.
3. Verify install from registry in a clean Astro project.
4. Publish technical article.
5. Post to Astro and Cloudflare communities.
6. Open Show HN only after live demo works.
7. Invite pilot sites individually.

Use links with `utm_source`, `utm_medium`, and `utm_campaign=launch-0-3`.

Do not invent adoption claims, testimonials, or token benchmarks. Add production sites only after verification and permission.
