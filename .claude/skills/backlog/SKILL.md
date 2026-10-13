---
name: backlog
description: >-
  Set up, record, analyze, prioritize, and work tickets in the project backlog (docs/backlog/). Use
  whenever the user talks about the backlog or tickets: adding/recording an idea or issue, ticket IDs
  like SEO-03, "work on / do / pick up" a ticket, marking done/blocked/dropped, re-prioritizing,
  "what's next", "what can you do without me", creating a new backlog topic, or initializing a
  backlog in a project that doesn't have one.
argument-hint: "[init | record <idea> | work <ID> | update <ID> <change> | next [full|partial|manual]]"
---

# Backlog

A Jira-like backlog kept as Markdown in the repo, so any agent (Claude Code, Cursor, cloud sessions)
and any human can read and update it.

## Layout

```
docs/backlog/
  backlog-master-list.md   # status board — the main entry; one row per ticket
  <topic>.md               # reference doc per topic: context, data, full ticket details
```

- Ticket IDs: `<PREFIX>-<NN>` with a per-topic prefix (`SEO-01`, `PERF-03`). Never reuse or renumber.
- The master list owns **status**. The topic doc owns the **analysis and details**. Ratings
  (automation, impact, effort, priority) appear in both — when one changes, update both.
- Templates for new files: [templates/backlog-master-list.md](templates/backlog-master-list.md),
  [templates/topic.md](templates/topic.md).

## Ticket analysis (required for every ticket)

Every ticket is rated on these axes. Base ratings on evidence (code, analytics, search data) and
investigate before rating; if something can't be known yet, say so in the rationale instead of
guessing.

**Automation** — who has to do the work:

| Level | Meaning |
| --- | --- |
| Full | Agent can do it end-to-end in the repo and verify it. Human only reviews the diff. |
| Partial | Agent does the bulk but needs specific human input: a decision, approval of copy/design, a dashboard/account step, or data the agent can't fetch. |
| Manual | Requires human action outside the repo (accounts, dashboards, design, real-world). Agent supplies exact instructions. |

Always state the **Human input** explicitly — `None.` for Full, otherwise exactly what is needed.

**Impact** — effect on the topic's goal:

| Level | Meaning |
| --- | --- |
| High | Noticeably moves a key metric, or unblocks other high-impact work. Backed by evidence. |
| Medium | Measurable but limited, or potentially high but uncertain. |
| Low | Hygiene, correctness, or maintainability; little measurable effect. |

**Effort** — total cost, agent time plus human time:

| Size | Meaning |
| --- | --- |
| S | ≤ ~1h agent work and ≤ 15 min human time. |
| M | Up to ~half a day agent work, or ≤ 1h human time. |
| L | More than M, or needs multi-week measure-and-wait cycles. |

**Priority** — derived from impact × effort:

| | S | M | L |
| --- | --- | --- | --- |
| **High** | P0 | P0 | P1 |
| **Medium** | P1 | P2 | P2 |
| **Low** | P2 | P3 | P3 |

You may override the matrix (dependency, risk, deadline), but write the reason in the ticket.

**Status:** `Todo` · `In progress` · `Blocked` (say on what/whom in the ticket) · `Done` · `Dropped`

## Ticket format (in the topic doc)

```markdown
<a id="seo-01"></a>
### SEO-01 — <Short imperative title>

**Automation:** Full · **Impact:** High · **Effort:** S · **Priority:** P0

- **Problem:** what's wrong or missing, with evidence.
- **Where:** `path/to/file.ts:123` (optional).
- **Fix:** the intended change.
- **Human input:** None. | <exact decision / access / action needed>
- **Impact rationale:** why this rating — cite data.
- **Effort rationale:** agent ~X; human ~Y.
- **Depends on:** SEO-xx (optional).
- **Done when:** observable acceptance criteria.
```

The anchor is the lowercased ID. When a ticket is finished, append
`- **Outcome (YYYY-MM-DD):** what shipped / what was verified.`

## Master list row format

Per topic, three tables grouped by automation (**Full**, **Partial**, **Manual**), each sorted by
priority then ID:

```markdown
| ID | Title | Impact | Effort | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| [SEO-01](seo.md#seo-01) | Render JSON-LD as real `<script>` tags | High | S | P0 | Todo |
```

## Operations

### init — set up a backlog

Use when `docs/backlog/backlog-master-list.md` doesn't exist.

1. Create `docs/backlog/backlog-master-list.md` from the template.
2. Add a pointer to the project's agent instructions (`AGENTS.md`, else `CLAUDE.md`, else create
   `AGENTS.md`): link the master list and say "use the backlog skill
   (`.claude/skills/backlog/SKILL.md`) to record or work tickets; update status rows when a ticket
   changes".
3. If the user already has items in mind, continue with **record**.

### record — add a ticket

1. Pick the topic. If none fits, create `<topic>.md` from the template, choose a new short
   uppercase prefix, and add the topic to the master list's Topics table plus a topic section.
2. Investigate enough to analyze: find the code location, check data the user has provided or that
   the agent can fetch. Ask the user only for what blocks the analysis.
3. Fill every field of the ticket format, including all ratings and rationales.
4. Assign the next unused number for that prefix (check both the master list and the topic doc).
5. Write the ticket into the topic doc and add its row to the right automation table, in priority
   order. Status `Todo`.
6. Report back in one short block: ID, title, automation, impact, effort, priority, and the human
   input needed (if any).

Several ideas at once: record each as its own ticket; split an idea that mixes Full and Manual
work into separate tickets when the parts can ship independently.

### work — do a ticket

1. Read the ticket. If a dependency isn't `Done`, tell the user and stop unless they say proceed.
2. Set status `In progress` in the master list.
3. By automation level:
   - **Full** — implement, verify with the project's checks (see `AGENTS.md`/`CLAUDE.md`: tests,
     lint, load the affected page), then set `Done` and add the Outcome line.
   - **Partial** — do the agent part, then ask for the human input. Set `Blocked` (note "waiting on
     user: …") until it arrives; finish and set `Done` after.
   - **Manual** — give the user numbered, copy-pasteable steps. Keep `In progress` until the user
     confirms; then set `Done` with the Outcome line. Verify yourself where possible (e.g. `curl`).
4. If the work reveals new issues, record them as new tickets rather than expanding scope.
5. Do not commit unless the user asks.

### update — change a ticket

- Status, priority, or re-analysis: edit both the master list row and the ticket's ratings line;
  add a one-line reason in the ticket for priority overrides or re-ratings.
- Drop: set `Dropped` and add `- **Dropped (YYYY-MM-DD):** reason.` Never delete the ticket.
- Move between automation tables if the automation level changes.

### next — what to do next

List open tickets (`Todo`, `In progress`, `Blocked`) sorted by priority, then impact. Filter on
request: "what can you do without me" → Full; "what do you need from me" → Partial (human part) +
Manual. Show ID, title, priority, and for non-Full tickets the human input. Recommend the top one
or two, noting dependencies.
