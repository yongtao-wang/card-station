# Accessibility — Reference

Status board: [backlog-master-list.md](backlog-master-list.md).

## Context

No audit has been done yet. Contrast fixes on `/games` and 404 are tracked as
[SEO-11](seo.md#seo-11).

## Tickets

<a id="a11y-01"></a>
### A11Y-01 — Accessibility audit (axe + manual)

**Automation:** Full · **Impact:** Medium · **Effort:** M · **Priority:** P2

- **Fix:** Run axe (or Lighthouse accessibility) on `/`, `/games`, and each game page; check manually
  for ARIA roles, visible focus states, color contrast, and keyboard traps in game controls.
- **Human input:** None.
- **Impact rationale:** Unknown issue count; games with custom controls are the likeliest problems.
- **Effort rationale:** agent ~2–3h for the audit (fixes become separate tickets).
- **Done when:** findings recorded as follow-up tickets (`A11Y-02`, …), each with ratings.
