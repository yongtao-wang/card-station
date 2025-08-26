# Card Station Roadmap

This roadmap focuses on SEO, content depth, UX polish, and future scalability. Items are grouped by phase (earliest = highest leverage). ✅ indicates already delivered.

## Legend

- Priority: (P0 = highest impact / low effort, P1 = high impact, P2 = medium, P3 = nice-to-have)
- Effort: S (≤1h), M (1–3h), L (half day+)

## Recently Completed (Baseline)

- ✅ Global metadata (title template, description, keywords, Open Graph, Twitter) — P0
- ✅ Dynamic per‑game metadata via `generateMetadata` — P0
- ✅ Sitemap generation (`app/sitemap.ts`) + robots.txt reference — P0
- ✅ Site JSON-LD (WebSite + hasPart Game list) — P1
- ✅ Canonical URL infra (`NEXT_PUBLIC_SITE_URL`) placeholder — P1

## Phase 1 (Technical SEO Quick Wins)

1. Dynamic OG Image Generator Route (API) — P0 / M
    - Generate social cards per game (title + emoji + background).
    - Acceptance: Each `/games/[slug]` returns `og:image` URL; sharing shows custom card.
1. Per-Game JSON-LD (Game schema) — P0 / S
    - Inject dedicated `<script type="application/ld+json">` with Game attributes.
    - Acceptance: Each game page validates in Rich Results Test.
1. Improve Image Semantics — P0 / S
    - Replace raw `<img>` with Next `<Image>` + informative alt text.
    - Add explicit width/height for CLS; ensure memory card alt reflects symbol.
1. Canonical Domain Enforcement — P0 / S
    - Set `NEXT_PUBLIC_SITE_URL` in deployment; add `alternates.canonical` to home/about.
1. Custom 404 / Not Found Page — P1 / S
    - Internal links back to games; encourage deeper crawl.

## Phase 2 (Content & Rich Results)

1. Breadcrumb Navigation + BreadcrumbList JSON-LD — P1 / S
    - Header or inline breadcrumbs: Home > Games > Game.
1. Add /games Index Page (SEO landing) — P1 / M
    - Consolidated descriptive content + links to each game (semantic anchors).
1. Game Detail: “How to Play” & Strategy Tips Section — P1 / M
    - Unique copy (150–250 words) per game to avoid thin pages.
1. FAQ Section + FAQPage Schema (select games) — P1 / S
    - 3–5 concise Q&A (rules, scoring, tips) for eligible rich snippets.
1. Internal Cross-Linking Enhancements — P2 / S
     - Contextual links inside “How to Play” referencing related games.

## Phase 3 (Performance & Observability)

1. Bundle Audit & Code Splitting — P1 / M
    - Lazy load non-active game components; inspect with `next build --analyze`.
1. Add Lightweight Analytics (e.g., Plausible) — P2 / S
    - Track page views, game engagement, exit points.
1. Web Vitals Monitoring (Next.js built-in + console logging) — P2 / S
    - Optional: send to analytics for correlation with ranking changes.
1. Preload Critical Assets — P2 / S
    - Fonts (if added), hero OG background, sprite sheet(s).

## Phase 4 (Scalability & Internationalization)

1. i18n Structure (Next.js i18n routing) — P2 / L
    - Prepare `en` baseline; abstract copy strings.
1. Duplicate Content Guardrails — P2 / S
    - Lint/check script preventing identical descriptions in `games/index.ts`.
1. Accessibility Audit (axe + manual) — P2 / M
    - ARIA roles, focus states, color contrast, keyboard traps.
1. PWA Enhancements (manifest, service worker) — P3 / M
    - Potential minor SEO benefit (installability + engagement).

## Stretch / Nice-to-Have

1. Leaderboard / Social Proof (serverless) — P3 / L
1. User Saved Settings Sync (cookies / localStorage migration) — P3 / M
1. Structured Data Expansion (Organization, potentialAction search) — P3 / S

## Implementation Order (Condensed)

P0: 1,2,3,4 → deploy → 5 → 6,7,8,9 → 11 → 12 → 15.

## Tracking Template (Use in Issues)

Title: [Phase X] \<Feature\>
Description: Summary + rationale.
Acceptance Criteria:

- [ ] ...

Metrics (if applicable): Baseline vs Target.
Risks / Mitigations: ...

## Metrics & Signals to Monitor

- Organic impressions & clicks (Search Console) per game slug.
- Avg position for “blackjack online”, “memory card game online”, etc.
- Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- Engagement: avg time on game page, completion rate (future instrumentation).

## Dependencies / Notes

- Set `NEXT_PUBLIC_SITE_URL` before Phase 1 completion for canonical correctness.
- Per-game JSON-LD and OG images should reuse a central game metadata utility.
- Avoid simultaneous large code + content changes when measuring SEO impact; batch by phase.

---
Last updated: 2025-08-26
