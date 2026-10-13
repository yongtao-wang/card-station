# Features & Platform — Reference

Status board: [backlog-master-list.md](backlog-master-list.md).

## Context

All tickets here need a product decision before work starts. The site is client-only with no
backend; anything that needs server-side state changes that.

## Tickets

<a id="feat-01"></a>
### FEAT-01 — Internationalization structure

**Automation:** Partial · **Impact:** Low · **Effort:** L · **Priority:** P3

- **Fix:** Prepare an `en` baseline and move UI copy into message files so locales can be added.
- **Human input:** Decide whether and which locales to target.
- **Impact rationale:** Some non-English demand (Polish War queries, e.g. "wojna karty online"), but
  volume is small today.
- **Effort rationale:** agent 1–2 days to extract copy across six games.
- **Done when:** UI copy comes from message files; adding a locale needs no code changes.

<a id="feat-02"></a>
### FEAT-02 — PWA: offline support

**Automation:** Partial · **Impact:** Low · **Effort:** M · **Priority:** P3

- **Fix:** Service worker so games work offline. The manifest itself is [SEO-12](seo.md#seo-12).
- **Human input:** Decide whether offline play is wanted.
- **Impact rationale:** Engagement nicety; minimal SEO effect.
- **Effort rationale:** agent ~half day including cache-invalidation testing.
- **Done when:** a visited game loads with the network off.

<a id="feat-03"></a>
### FEAT-03 — Leaderboard / social proof

**Automation:** Partial · **Impact:** Medium · **Effort:** L · **Priority:** P2

- **Fix:** Scores/leaderboard per game.
- **Human input:** Scope and whether to add a backend (serverless + storage, abuse prevention).
- **Impact rationale:** Could improve return visits; unproven for this audience.
- **Effort rationale:** several days including backend setup.
- **Done when:** defined after the scope decision.

<a id="feat-04"></a>
### FEAT-04 — Saved settings sync

**Automation:** Partial · **Impact:** Low · **Effort:** L · **Priority:** P3

- **Fix:** Each game keeps its own `localStorage` keys; define what "sync" means (across games?
  devices?). Cross-device sync needs a backend.
- **Human input:** Define the goal.
- **Impact rationale:** No user demand recorded.
- **Effort rationale:** depends on scope; cross-device is several days.
- **Done when:** defined after the scope decision.
