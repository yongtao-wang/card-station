---
name: backlog-gh
description: >-
  Keep the project's backlog as GitHub issues, via the gh CLI: set a repo up for it, add a ticket
  for an issue or an idea, close or drop one. Use when the user mentions the backlog, a ticket,
  something to fix or try later, or an issue number.
argument-hint: "[setup | add <idea> | close <#N> | drop <#N>]"
---

# Backlog on GitHub

The backlog is the repo's **open GitHub issues**. One issue is one ticket — an issue or an idea,
no further type. Everything goes through `gh`; if it isn't installed or authenticated, say so and
stop.

**Labels** carry the metadata:

| Label | Meaning |
| --- | --- |
| `auto` | An agent can do it alone and verify it. No label: it needs the user, and the description says for what. |
| `priority: high` / `priority: low` | Urgency. No label: normal. |

**Body** — the same two sections the issue form produces:

```markdown
### Description

What the problem or idea is, and why it matters.

### Investigation

Optional. What was checked, the cause if known, guesses still to test.
```

Reading the backlog needs no procedure: `gh issue list` (filter with `--label auto` or
`--label "priority: high"`) and `gh issue view <N>`.

## setup — once per repo

**1. Labels** — `--force` makes this safe to re-run.

```bash
gh label create auto --color 0e8a16 --description "An agent can do it alone" --force
gh label create "priority: high" --color d93f0b --description "Do soon" --force
gh label create "priority: low" --color c5def5 --description "Whenever" --force
```

**2. Issue form**, so tickets filed in the web UI take the same shape. Commit it to the default
branch.

```bash
mkdir -p .github/ISSUE_TEMPLATE
[ -e .github/ISSUE_TEMPLATE/ticket.yml ] || cat > .github/ISSUE_TEMPLATE/ticket.yml <<'EOF'
name: Ticket
description: An issue or an idea to come back to.
body:
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What the problem or idea is, and why it matters.
    validations:
      required: true
  - type: textarea
    id: investigation
    attributes:
      label: Investigation
      description: Optional. What was checked, the cause if known, guesses still to test.
EOF
```

**3. Existing backlog files** (a `backlog.md`, `TODO.md`, known-issues list): show the user one
line per entry — proposed title and labels — and wait for a go-ahead. Then create one issue per
entry, keeping its full text, delete the file, and fix every reference to it (`git grep`).

**4. Point the agent instructions** (`AGENTS.md`, else `CLAUDE.md`) at the issues and this skill.

## add — a ticket

1. One issue per idea; split a message that holds several.
2. Propose a short title, and say which labels you would set — `auto` or not, and the priority —
   with a word on why. The user corrects them.
3. Agree with the user what goes in Investigation, if anything. Leave the section out when there
   is nothing to put in it.
4. Create it only once the user says yes — never on your own initiative, even when the idea came
   up mid-conversation. Report the number and URL.

```bash
gh issue create --title "<title>" --label auto --label "priority: high" --body-file - <<'EOF'
### Description
...
EOF
```

## close / drop

- **Done:** put `Fixes #N` in the commit that resolves it; it closes when the commit reaches the
  default branch, and the issue links the commit. No commit to point at: `gh issue close N`.
- **Dropped:** no record is kept — `gh issue delete N --yes`. It is permanent, so confirm first.
