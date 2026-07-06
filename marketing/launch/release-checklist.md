# v0.3 release checklist

## Preflight

- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm --filter astro-markdown-for-agents-example build`
- [ ] `pnpm docs:build`
- [ ] `pnpm pack --dry-run`
- [ ] `git diff --check`
- [ ] Confirm `main` is green on GitHub
- [ ] Confirm docs deploy succeeded

## Tag

- [ ] Merge PR `#2`
- [ ] Pull latest `main`
- [ ] Create annotated tag `v0.3.0`
- [ ] Push tag to origin

## Publish

- [ ] Verify the npm package contents one more time
- [ ] Publish `@puralex/astro-markdown-for-agents@0.3.0` with provenance
- [ ] Confirm the registry version is visible
- [ ] Install from npm in a clean Astro project
- [ ] Verify the demo and docs links from the published package README

## Launch

- [ ] Post the announcement
- [ ] Post the technical article
- [ ] Share in Astro and Cloudflare communities
- [ ] Open Show HN after the live demo and registry version are both live
- [ ] Start pilot outreach

