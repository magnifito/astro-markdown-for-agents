# Pilot outreach pack

Research date: 2026-07-06. Candidates use Astro Starlight publicly or maintain Starlight deployment tooling.

## Outreach rules

- Contact maintainers through an existing community, public contact method, or GitHub Discussion.
- Do not open a bug issue solely to pitch the package.
- Ask for permission before opening an implementation PR.
- Offer setup and payload review; do not ask for a testimonial upfront.
- Stop after one message and one follow-up.

## Base message

> I noticed **[specific project/docs detail]** uses Astro Starlight. I maintain an Astro integration that generates clean `.md` versions and `llms.txt`, with optional `Accept: text/markdown` negotiation for SSR. I am recruiting ten pilot sites and can prepare the setup plus review representative code/table pages. Would this be useful for **[project]**? Demo: https://magnifito.github.io/astro-markdown-for-agents/demo/

## 15 qualified candidates

### 1. gren-lang/book

- Repo: https://github.com/gren-lang/book
- Site: https://gren-lang.org/book/
- Fit: Programming-language book; coding agents benefit from stable, low-noise chapters.
- Hook: “Gren language questions often require loading several book chapters; generated Markdown would give agents direct chapter URLs.”
- Channel: Gren community/contact path from project README. Ask before proposing a PR.

### 2. arianrhodsandlot/nostalgist

- Repo: https://github.com/arianrhodsandlot/nostalgist
- Site: https://nostalgist.js.org
- Fit: Popular JavaScript emulator library with active public documentation.
- Hook: “Nostalgist has API and setup material that coding agents fetch while generating integrations.”
- Channel: GitHub Discussions is enabled. Use a short idea post, not an issue.

### 3. bitaxeorg/osmu-wiki

- Repo: https://github.com/bitaxeorg/osmu-wiki
- Site: https://osmu.wiki
- Fit: Hardware wiki with procedural pages and troubleshooting content.
- Hook: “Direct Markdown versions could keep commands and hardware steps intact while stripping wiki navigation.”
- Channel: Existing project community listed in README; request pilot permission.

### 4. teemopay/docs

- Repo: https://github.com/teemopay/docs
- Site: https://docs.teemopay.com
- Fit: Actively updated payment documentation where precise API context matters.
- Hook: “Payment integration agents need exact request examples and warnings; this pilot would review those pages specifically.”
- Channel: Teemopay public contact/community. Avoid support issue tracker for outreach.

### 5. dotnetthailand/dotnetthailand.github.io

- Repo: https://github.com/dotnetthailand/dotnetthailand.github.io
- Site: https://www.dotnetthailand.com
- Fit: Public technical education content with an established community.
- Hook: “Machine-readable article pages could help assistants answer Thai .NET questions from the original source.”
- Channel: Community contact listed on site or repository.

### 6. caleb531/jcanvas-website

- Repo: https://github.com/caleb531/jcanvas-website
- Site: https://projects.calebevans.me/jcanvas/
- Fit: Library documentation with API examples and code.
- Hook: “jCanvas usage questions are code-heavy; the pilot would verify examples and API links survive conversion.”
- Channel: Maintainer public profile/contact.

### 7. jyablonski/doqs

- Repo: https://github.com/jyablonski/doqs
- Site: https://doqs.jyablonski.dev
- Fit: Active Starlight documentation project and clean pilot-sized surface.
- Hook: “Doqs is a compact site for validating full-site `llms.txt` and direct Markdown discovery.”
- Channel: Maintainer public profile/contact.

### 8. Mohamed-Kaizen/titania-ui

- Repo: https://github.com/Mohamed-Kaizen/titania-ui
- Site: https://titania-ui.vercel.app
- Fit: UI library documentation with component examples.
- Hook: “Component-library docs expose converter edge cases around demos, props, code, and custom elements.”
- Channel: Maintainer public profile/contact.

### 9. Lum0s-Solutions/synos-site

- Repo: https://github.com/Lum0s-Solutions/synos-site
- Fit: Current Starlight documentation explicitly deployed through Cloudflare.
- Hook: “This is a direct Cloudflare Free pilot: compare static `.md` delivery with optional runtime negotiation.”
- Channel: Organization public contact or repository maintainer profile.

### 10. coopfinance/coopfin-docs

- Repo: https://github.com/coopfinance/coopfin-docs
- Fit: Active product documentation built with Starlight.
- Hook: “Finance documentation benefits from preserving warnings and exact procedures while removing interface chrome.”
- Channel: CoopFinance public project contact.

### 11. robinmordasiewicz/f5xc-docs-builder

- Repo: https://github.com/robinmordasiewicz/f5xc-docs-builder
- Site: https://robinmordasiewicz.github.io/f5xc-docs-builder/
- Fit: Centralized Starlight documentation builder; one integration could reach many generated sites.
- Hook: “Adding an optional Markdown-for-agents preset to the builder would multiply adoption across generated portals.”
- Channel: Maintainer public profile. Ask about integration fit before PR.

### 12. j-romo/devportals-starlight

- Repo: https://github.com/j-romo/devportals-starlight
- Site: https://devportals.tech
- Fit: Developer-portal reference implementation and technical-writing showcase.
- Hook: “Agent-readable delivery is a natural developer-portal pattern; measured output could become a documented example.”
- Channel: Maintainer/site contact.

### 13. Shielded-Protocol/shielded-docs

- Repo: https://github.com/Shielded-Protocol/shielded-docs
- Fit: Integration and compliance documentation with terminology-sensitive content.
- Hook: “Pilot review can focus on preserving compliance warnings, glossary terms, and integration code.”
- Channel: Protocol community listed by project. Do not use security channels.

### 14. peteretelej/starlight-action

- Repo: https://github.com/peteretelej/starlight-action
- Site: https://github.com/marketplace/actions/starlight-action
- Fit: Generates Starlight sites from repository docs.
- Hook: “An optional package/config flag could make every generated documentation site emit `.md` pages and `llms.txt`.”
- Channel: Maintainer public profile. Partnership request, not end-user pitch.

### 15. 30DaysOf/astro-starlight-ghpages

- Repo: https://github.com/30DaysOf/astro-starlight-ghpages
- Site: https://30daysof.github.io/astro-starlight-ghpages/
- Fit: Reusable GitHub Pages template where static Markdown behavior can be demonstrated accurately.
- Hook: “Template can expose direct `.md` pages and `llms.txt` without claiming unsupported header negotiation.”
- Channel: Maintainer public profile. Ask permission for a template PR.

## Follow-up

> Closing the loop on the Astro Markdown pilot. No action needed if it is not relevant. If useful, I can send a minimal config diff and payload comparison for one public page.

Track consent, reply, install, deployment URL, and attribution permission. Never add a project to “Used by” based only on repository dependency data.
