# Marketing metrics

Baseline date: 2026-07-06.

## Baseline

- GitHub stars: 2
- npm downloads, previous 30 days: 120
- Astro directory search: listed; 118 weekly downloads displayed
- Verified external production sites: 0
- Approved testimonials: 0

Sources:

- https://github.com/magnifito/astro-markdown-for-agents
- https://api.npmjs.org/downloads/point/last-month/%40puralex%2Fastro-markdown-for-agents
- https://astro.build/integrations/?search=markdown-for-agents

## 30-day targets

| Metric | Target | Why |
|---|---:|---|
| Verified production sites | 10 | Real activation |
| Approved testimonials | 3 | Trust |
| Monthly npm downloads | 1,000 | Acquisition |
| GitHub stars | 50 | Developer interest |
| Demo → npm click rate | 8% | Landing-page conversion |
| Pilot applications | 15 | Qualified pipeline |

## Tracking

Set `PUBLIC_PLAUSIBLE_DOMAIN` during documentation deployment. CTA elements contain stable `data-track` values:

- `hero-install`
- `hero-markdown`
- `install-npm`
- `pilot-apply`

Use UTM parameters:

```text
utm_source=<channel>
utm_medium=community|organic|outreach
utm_campaign=launch-0-3
```

Review weekly:

1. npm download trend, excluding release-day automation spikes.
2. GitHub traffic sources and clone count.
3. Documentation visits and CTA events.
4. Pilot applications, successful installs, and unresolved blockers.
5. Search impressions for “Astro Markdown for Agents,” “Astro llms.txt,” and “Cloudflare Markdown for Agents free.”

Do not add package telemetry. Measure public funnel events and voluntary pilot participation.
