# Backlog — Master List

The main entry point for planned work. Each row is a ticket; the ID links to its full details in the
topic's reference doc. Procedures and the full rating rubric live in the backlog skill
(`.claude/skills/backlog/SKILL.md`).

## Legend

- **Automation:** `Full` agent does it end-to-end · `Partial` agent + specific human input ·
  `Manual` human action outside the repo
- **Impact:** `High` · `Medium` · `Low` — effect on the topic's goal
- **Effort:** `S` ≤1h agent / ≤15 min human · `M` ≤half day / ≤1h human · `L` more
- **Priority:** impact × effort — High: S/M→P0, L→P1 · Medium: S→P1, M/L→P2 · Low: S→P2, M/L→P3
- **Status:** `Todo` · `In progress` · `Blocked` · `Done` · `Dropped`

## Topics

| Prefix | Topic | Reference doc |
| --- | --- | --- |
| SEO | Search engine optimization (Google + Bing) | [seo.md](seo.md) |
| PERF | Performance | [performance.md](performance.md) |
| A11Y | Accessibility | [accessibility.md](accessibility.md) |
| FEAT | Features & platform | [features.md](features.md) |

## SEO

Baseline, phases, and sequencing rules: [seo.md](seo.md).

### Full

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [SEO-01](seo.md#seo-01) | Render JSON-LD as real `<script>` tags | High | S | P0 | Done |
| [SEO-06](seo.md#seo-06) | Real `lastModified` dates in sitemap | Medium | S | P1 | Done |
| [SEO-08](seo.md#seo-08) | Move OG image map into the game registry | Medium | S | P1 | Done |
| [SEO-09](seo.md#seo-09) | One visible `<h1>` per game page | Medium | S | P1 | Done |
| [SEO-02](seo.md#seo-02) | Fix broken `/games/texas-holdem` link | Low | S | P2 | Done |
| [SEO-03](seo.md#seo-03) | Remove fake `SearchAction` from WebSite JSON-LD | Low | S | P2 | Done |
| [SEO-04](seo.md#seo-04) | Remove doubled brand in page titles | Low | S | P2 | Done |
| [SEO-05](seo.md#seo-05) | Fix nested links on `/games` | Low | S | P2 | Done |
| [SEO-07](seo.md#seo-07) | Richer structured data: VideoGame, BreadcrumbList, Organization | Medium | M | P2 | Done |
| [SEO-10](seo.md#seo-10) | Internal links: nav, footer, "Now Trending" tiles | Low | S | P2 | Done |
| [SEO-11](seo.md#seo-11) | Fix low-contrast text on `/games` and 404 | Low | S | P2 | Done |
| [SEO-12](seo.md#seo-12) | Web manifest + apple-touch-icon | Low | S | P2 | Done |
| [SEO-13](seo.md#seo-13) | Fix domain in AGENTS.md | Low | S | P2 | Done |
| [SEO-26](seo.md#seo-26) | Guard against duplicate game descriptions | Low | S | P2 | Done |

### Partial

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [SEO-14](seo.md#seo-14) | IndexNow: key file + ping on deploy | High | S | P0 | Todo |
| [SEO-15](seo.md#seo-15) | Retarget titles/descriptions — batch A: War, High Low | High | S | P0 | Todo |
| [SEO-16](seo.md#seo-16) | Retarget titles/descriptions — batch B: Hold'em, Flip Card | Medium | S | P1 | Todo |
| [SEO-18](seo.md#seo-18) | Per-game FAQ / rules / strategy content | High | L | P1 | Todo |
| [SEO-21](seo.md#seo-21) | Monthly metrics snapshot | Medium | S | P1 | Todo |
| [SEO-17](seo.md#seo-17) | Retarget titles/descriptions — batch C: Snap, Blackjack | Low | S | P2 | Todo |
| [SEO-19](seo.md#seo-19) | High Low: show next-card odds | Medium | M | P2 | Todo |
| [SEO-20](seo.md#seo-20) | Correct inaccurate claims on About page | Low | S | P2 | Todo |

### Manual

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [SEO-22](seo.md#seo-22) | Set up Bing Webmaster Tools + submit sitemap | High | S | P0 | Todo |
| [SEO-23](seo.md#seo-23) | Make apex → www redirect permanent (308) | Medium | S | P1 | Todo |
| [SEO-24](seo.md#seo-24) | Validate rich results and request re-crawl | Medium | S | P1 | Todo |
| [SEO-25](seo.md#seo-25) | Produce 1200×630 OG images | Low | M | P3 | Todo |

## Performance

### Full

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [PERF-01](performance.md#perf-01) | Bundle audit + lazy-load game components | Medium | M | P2 | Todo |
| [PERF-02](performance.md#perf-02) | Preload critical assets | Low | S | P2 | Todo |

### Partial

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [PERF-03](performance.md#perf-03) | Review Core Web Vitals | Medium | S | P1 | Todo |

## Accessibility

### Full

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [A11Y-01](accessibility.md#a11y-01) | Accessibility audit (axe + manual) | Medium | M | P2 | Todo |

## Features & platform

### Partial

| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [FEAT-03](features.md#feat-03) | Leaderboard / social proof | Medium | L | P2 | Todo |
| [FEAT-01](features.md#feat-01) | Internationalization structure | Low | L | P3 | Todo |
| [FEAT-02](features.md#feat-02) | PWA: offline support | Low | M | P3 | Todo |
| [FEAT-04](features.md#feat-04) | Saved settings sync | Low | L | P3 | Todo |
