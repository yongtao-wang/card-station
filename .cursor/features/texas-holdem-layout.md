# Texas Hold'em — UI Change Spec

Implementation brief for four UI features of the heads-up (2-player) Hold'em table. Scope is **layout and presentation only** — do not change game-engine rules, betting math, or the bot. Stack is React (function components + hooks) with a plain CSS stylesheet.

**Styling note:** match the project's existing visual language — reuse the current color tokens, fonts, spacing, radii, shadows, and glass/card treatments already in the stylesheet. The values below describe *intent and relative emphasis*, not exact numbers. Only treat a dimension as fixed when this doc says it is design-critical (e.g. the rounded table ends). Otherwise, fit it to what looks consistent with the current UI.

Scope (only these four):
1. Hand log
2. Current highest hand indicator (top-right)
3. Table layout
4. Button (action) layout

---

## 1. Hand log

A live, append-only feed of every action in the current hand.

**Placement**
- Floating panel pinned to the **top-left** of the game stage (the felt area).
- Compact card, consistent with the project's existing panel/glass styling. Constrained height with internal scroll.

**Content**
- Header row: a `HAND LOG` label on the left, current hand number `#N` on the right.
- Scrollable list below, newest entries at the bottom. Show roughly the last dozen entries; cap stored history (~30) so it doesn't grow unbounded.
- Each entry is one line:
  - Player actions are prefixed with a short author tag — `You` and `Mav` (the bot) — visually distinguished from each other, followed by the action text, e.g. `You calls $40`, `Mav raises to $120`.
  - System lines have **no** author tag and read as neutral narration, e.g. `Flop`, `Turn`, `River`, `Hand #3 — You on the button`, `You win — Two Pair`.

**Behavior**
- Append an entry on every: blind post, check, call, bet/raise, fold, all-in, street change (flop/turn/river), and showdown result.
- List scrolls internally; **never** let it grow the page or scroll horizontally — wrap long text and suppress any horizontal scrollbar.

**Responsive**
- Hidden on mobile to save space.

---

## 2. Current highest hand indicator (top-right)

Shows the best 5-card hand the human player currently holds, evaluated from their 2 hole cards + visible community cards.

**Placement**
- Floating panel pinned to the **top-right** of the stage, using the same panel styling as the hand log.

**Content**
- A `YOUR HAND` label.
- The hand name, visually prominent, e.g. `Pair`, `Two Pair`, `Flush`, `Full House`, `High Card`.
- A strength meter bar underneath: a track with a fill whose width is proportional to hand rank. Ranks are the 9 standard categories ordered 0–8 (High Card → Straight Flush); fill width = `(rank + 1) / 9`.

**Behavior**
- Recompute whenever the hole cards or community cards change (preflop shows the made hand from just the 2 hole cards; updates on flop/turn/river).
- Only reflects the **human** player's hand. Never reveal the bot's hand here.
- Hidden when the player has no cards (between hands).

**Responsive**
- On mobile, move it to the **bottom-right** and scale it down so it doesn't crowd the table.

---

## 3. Table layout

Top-down view of a **stadium** table: a rectangle with fully-rounded (semicircular) left and right ends.

**Shape (design-critical)**
- The table must be a **stadium** shape — a wide rectangle whose left and right ends are full semicircles (achieved with a very large/pill border-radius). It must **not** be a hexagon and **not** a rectangle with merely small rounded corners.
- Keep the existing felt fill and the brass rail/trim ring treatment already in the design.

**Sizing**
- Roughly 1.7:1 aspect ratio. **Critical:** the table must always fit inside the stage without overflowing on short or narrow viewports — derive its size from the container and clamp both width and height so it scales down rather than clipping. Center it in the stage.

**Seats**
- Exactly two seats: **bot at top center**, **human at bottom center**, both horizontally centered and inset slightly from the table's top/bottom edge.
- Each seat = a name/chips plate (avatar + name + chip count, with the dealer button when applicable) plus that player's 2 cards. Bot's cards render face-down; human's face-up.
- The active player's plate is visually highlighted.

**Center cluster (stacked, centered)**
- Phase pill (`PRE-FLOP` / `FLOP` / `TURN` / `RIVER` / `SHOWDOWN`).
- Row of 5 community card slots; empty slots show a subtle placeholder, filled slots show the dealt card.
- Pot display: `POT` label + amount.

**Bet stacks**
- Each player's current wager renders as a small chip stack + amount, positioned between that seat and the center, and offset **off** the vertical center line (so the two stacks sit on opposite sides) so they never collide with the phase pill or pot.

**Responsive**
- On mobile the table becomes a **vertical** stadium (rounded **top/bottom** ends instead of left/right); seats stay top/bottom; cards and type scale down.

---

## 4. Button (action) layout

A single centered row of three equal-width buttons, with a slide-up sheet for sizing a raise. **Replace any inline raise slider / extra column** — the old multi-column action bar with a permanent slider must be removed.

**Action row (always visible at the bottom dock)**
Three equal-width buttons, centered:
1. **Fold**.
2. **Check** or **Call** (whichever is legal):
   - `Check` when there is nothing to call.
   - `Call $X` when facing a bet, with the call amount shown as a small hint.
3. **Raise** — the primary/emphasis button. Behavior:
   - If a raise is legal, it **toggles the slide-up sheet** (show a caret that flips to indicate open/closed; give it an active state while open).
   - If a raise is not possible but the player can still commit chips, it becomes **All In $X** and acts immediately (no sheet).
- Buttons are disabled when it is not the human's turn.

**Slide-up raise sheet (bottom sheet)**
- A **full-width** panel flush to the action dock, with **only its top corners rounded**, that **slides up from the bottom edge** to sit just above the action row. It is NOT a centered floating popover and must not look like one.
- Reveal animation: the panel grows from collapsed to its content height with hidden overflow, and the inner content eases upward slightly for a slide feel.
- A **dimming backdrop** covers the felt above the sheet while open; clicking it dismisses the sheet.
- Sheet contents, top to bottom:
  - A grab handle (small centered bar); clicking it dismisses.
  - A row with a `Raise to` label and the current amount.
  - A range slider for the raise amount (min = legal minimum raise, max = player's max/all-in, stepped by the big blind).
  - Preset buttons: `MIN`, `½ POT`, `POT`, `MAX`; the active preset is highlighted.
  - A full-width confirm button that reads `Raise to $X`, or `All In $X` when the amount equals the player's max.
- Dismiss / auto-close rules: close the sheet when the player confirms, when any other action button (Fold/Check/Call) is pressed, when the backdrop or grab handle is tapped, and automatically whenever it stops being the human's turn.

**Stacking**
- The action row must stay above the backdrop and sheet so the buttons remain visible and clickable throughout the animation.

**Responsive**
- On mobile the row stays three equal buttons (full width, hide the small hints if space is tight); the full-width sheet works as-is.

---

## Acceptance checklist
- [ ] Hand log appears top-left, logs every action + street + result, scrolls internally, no horizontal scrollbar, hidden on mobile.
- [ ] "Your Hand" indicator appears top-right, shows the human's current best hand name + proportional strength bar, updates each street, hidden when no cards; moves bottom-right on mobile.
- [ ] Table is a horizontal stadium (rounded left/right ends) with the existing rail treatment, fits the stage at all sizes, two seats top/bottom, centered phase pill + 5 community slots + pot, bet stacks offset off the center line; becomes a vertical stadium on mobile.
- [ ] Action bar is one centered row of three equal buttons (Fold / Check-or-Call / Raise); the old inline slider column is gone.
- [ ] Raise opens a full-width bottom sheet that slides up from the dock with a backdrop, slider, MIN/½POT/POT/MAX presets, and a confirm button that switches to "All In" at max; closes on confirm, other actions, backdrop/handle tap, or end of turn.
