# Adding a game

This guide walks through adding a new card game to Card Station. For the architectural background,
see [ARCHITECTURE.md](ARCHITECTURE.md). For a condensed checklist that the Cursor agent can apply
automatically, see [.cursor/skills/add-new-game/SKILL.md](../.cursor/skills/add-new-game/SKILL.md).

Throughout, `<slug>` is the URL-safe id (lowercase, no spaces) and `<Name>` is the PascalCase
component name. Example: slug `highlow`, name `HighLow`, served at `/games/highlow`.

## 1. Create the game folder

```
games/<slug>/
  <Name>.tsx          # the game component (must start with 'use client')
  <name>.module.css   # game-specific styles
```

Pick an implementation pattern based on complexity:

- Simple / mostly-linear state → self-contained component. Copy the shape of
  [games/highlow/HighLow.tsx](../games/highlow/HighLow.tsx): local `useState`, inline deck/shuffle
  helpers, `motion/react` animations.
- Multi-phase state machine → reducer pattern. Copy the structure under
  [games/blackjack/](../games/blackjack/): `types.ts`, `gameLogic.ts` (pure), `gameReducer.ts`,
  `use<Name>Game.ts`, optional `useAnimationSequencer.ts`, and a `components/` folder.
- Large single component with testable rules → component + pure module. Copy
  [games/holdem/](../games/holdem/): `<Name>.tsx` for UI/state, a sibling `*.ts` for pure logic
  (no React), and `*.test.ts` for Vitest. See [ARCHITECTURE.md](ARCHITECTURE.md#3-component--pure-logic-module-texas-holdem).

The component must be the default export and a client component:

```tsx
'use client'

import styles from './<name>.module.css'

export default function <Name>() {
  // game UI
}
```

### Make it responsive (required)

Card Station is mobile-first — the game must be playable on a phone, not just desktop. Design the
base layout for mobile and use Tailwind `sm:` (and larger) modifiers for desktop. Keep boards within
the viewport (no horizontal overflow), and scale spacing/card sizes down on small screens. If the
game positions cards by pixel offsets, measure the viewport and switch values per breakpoint on
`resize`, like Blackjack's `CARD_OFFSET_MOBILE` / `CARD_OFFSET_DESKTOP` in
[games/blackjack/types.ts](../games/blackjack/types.ts).

### Cards and assets

Card faces live at `/assets/img/cards/<rank>_of_<suit>.svg` (ranks `2`–`10`, `jack`, `queen`,
`king`, `ace`; suits `hearts`, `diamonds`, `clubs`, `spades`) with `card_back.jpg` for the back.

## 2. Register the game

Add an entry to [games/index.ts](../games/index.ts):

```ts
{
  slug: '<slug>',
  title: '<Display Title>',
  description: 'One-sentence description used on cards and in metadata.',
  emoji: '🂡',
},
```

This makes the game appear on the home page, `/games`, the sitemap, recommendations, and the global
JSON-LD automatically.

## 3. Wire the slug to the component

In [app/games/[slug]/page.tsx](../app/games/[slug]/page.tsx):

1. Import the component: `import <Name> from '@/games/<slug>/<Name>'`.
2. Add a case to the slug switch:

```tsx
{game.slug === '<slug>' && <<Name> />}
```

3. Add the OG image entry to the `getOgImage` map(s) in the same file.

## 4. Add the OG image map entry in GameCard

Add the same slug → image mapping in [components/GameCard.tsx](../components/GameCard.tsx)'s
`getOgImage`. (The map is intentionally duplicated across these files — keep both in sync.)

## 5. Add the OG image asset

Drop a 1200×630 (or compatible) image at:

```
public/assets/img/og/<slug>_og.webp
```

If omitted, the OG maps fall back to the holdem image.

## 6. Persistence convention

Store any progress in `localStorage` under a game-specific key prefix so games don't collide:

- Blackjack uses `bj_playerChips`, `bj_wins`, `bj_losses`.
- High Low uses `highlow-best-streak`.

Load saved state in a mount `useEffect`; write on change.

## 7. SEO "How to Play" content

Add a "How to Play" / rules section inside the game component (see the bottom of
[games/highlow/HighLow.tsx](../games/highlow/HighLow.tsx) or
[games/blackjack/BlackJack.tsx](../games/blackjack/BlackJack.tsx)). This gives each game page unique
copy and avoids thin-content SEO penalties.

## 8. Verify

- `npm test` passes (when the game has unit tests).
- `npm run lint` passes.
- `npm run dev`, then open `/games/<slug>` — the game renders (not just the page chrome).
- Check a mobile viewport (e.g. browser device toolbar): the board fits without horizontal overflow
  and controls are usable on a phone.
- The game card appears on `/` and `/games`, in the "You may also like" recommendations on other
  game pages, and in `/sitemap.xml`.
