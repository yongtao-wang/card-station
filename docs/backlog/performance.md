# Performance — Reference

Status board: [backlog-master-list.md](backlog-master-list.md).

## Context

Vercel Analytics and Speed Insights are already installed in `app/layout.tsx`. No performance
baseline has been recorded yet — PERF-03 establishes one.

## Tickets

<a id="perf-01"></a>
### PERF-01 — Bundle audit + lazy-load game components

**Automation:** Full · **Impact:** Medium · **Effort:** M · **Priority:** P2

- **Problem:** `app/games/[slug]/page.tsx` statically imports all six game components, so each game
  page may ship code for the others.
- **Fix:** Measure with `next build` output / a bundle analyzer, then load only the active game
  (e.g. `next/dynamic` per slug) if the audit shows a real cost.
- **Human input:** None.
- **Impact rationale:** Could cut JS on every game page; real size unknown until measured.
- **Effort rationale:** agent ~2–3h (audit + change + re-measure).
- **Done when:** per-route JS for a game page includes only that game; before/after numbers recorded here.

<a id="perf-02"></a>
### PERF-02 — Preload critical assets

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:** Preload what's needed above the fold: home hero/OG images, card back (`card_back.jpg`),
  sprite sheets used at game start.
- **Human input:** None.
- **Impact rationale:** Likely small LCP gain; confirm with PERF-03 data first.
- **Effort rationale:** agent ~45 min.
- **Done when:** Lighthouse shows no late-discovered critical images on `/` and one game page.

<a id="perf-03"></a>
### PERF-03 — Review Core Web Vitals

**Automation:** Partial · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Fix:** Flag pages outside the targets (LCP < 2.5s, CLS < 0.1, INP < 200ms) and record follow-up
  tickets here.
- **Human input:** Share the Speed Insights view from the Vercel dashboard (or confirm the agent may
  query it via the API).
- **Impact rationale:** Core Web Vitals are a ranking signal; this tells us whether PERF-01/02 matter.
- **Effort rationale:** agent ~30 min; human ~5 min.
- **Done when:** baseline recorded in Context; follow-ups filed.
