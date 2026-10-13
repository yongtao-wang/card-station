---
name: add-new-game
description: >-
  Scaffold and wire a new card game into the Card Station site. Use when the user asks to add a new
  game, create a card game, add a game to the site, or register a game under games/. Covers the game
  component, the games/index.ts registry (including ogImage), the slug switch, and SEO assets.
disable-model-invocation: true
---

# Add a new game to Card Station

Card Station games are client-only React components registered in a central array and wired into a
slug switch. A game is not fully added until every step below is done — a missing step means a 404,
no game render, or absence from listings/SEO.

`<slug>` = lowercase url id (e.g. `gofish`). `<Name>` = PascalCase component (e.g. `GoFish`).
`<name>` = lowercase css module base (e.g. `gofish`).

## Checklist

```
- [ ] 1. Create games/<slug>/<Name>.tsx + <name>.module.css (mobile-first, responsive)
- [ ] 2. Register in games/index.ts (slug, title, description, emoji, ogImage, updatedAt)
- [ ] 3. Add import + slug switch case in app/games/[slug]/page.tsx
- [ ] 4. Add public/assets/img/og/<slug>_og.webp and record its real size on ogImage
- [ ] 5. Use a game-specific localStorage key prefix
- [ ] 6. Add a "How to Play" SEO section in the component
- [ ] 7. Verify: npm test (if applicable) + npm run lint + open /games/<slug> on desktop AND a mobile viewport
```

## Step 1: Create the component

`games/<slug>/<Name>.tsx` must start with `'use client'` and default-export the component.
Choose a pattern:

- Simple state → self-contained file (model on `games/highlow/HighLow.tsx`): local `useState`,
  inline deck + Fisher–Yates shuffle, `motion/react` animations.
- Multi-phase state machine → reducer pattern (model on `games/blackjack/`): `types.ts`,
  `gameLogic.ts` (pure functions, no React), `gameReducer.ts`, `use<Name>Game.ts`, and a
  `components/` folder for presentational pieces.
- Large UI with testable rules → component + pure module (model on `games/holdem/`): `<Name>.tsx`,
  sibling `*.ts` for pure logic, `*.test.ts` for Vitest. See `docs/ARCHITECTURE.md`.

Add `games/<slug>/<name>.module.css` for game-specific styles; use Tailwind utilities for layout.
Card images: `/assets/img/cards/<rank>_of_<suit>.svg` and `card_back.jpg`.

Mobile-first is required: the game must be playable on a phone. Write base styles for mobile and use
Tailwind `sm:` (and larger) modifiers for desktop. Keep the board within the viewport (no horizontal
overflow) and scale spacing/card sizes down on small screens. For pixel-positioned cards, switch
values per breakpoint on `resize` (see `CARD_OFFSET_MOBILE` / `CARD_OFFSET_DESKTOP` in
`games/blackjack/types.ts`).

## Step 2: Register in games/index.ts

Append a `GameMeta` entry. This alone makes the game show on the home page, `/games`, the sitemap,
recommendations, and global JSON-LD.

```ts
{ slug: '<slug>', title: '<Title>', description: '<one sentence>', emoji: '🂡', ogImage: { src: '/assets/img/og/<slug>_og.webp', width: 300, height: 200 }, updatedAt: 'YYYY-MM-DD' },
```

`ogImage` width and height are the file's real pixel size. `updatedAt` is the sitemap date.

## Step 3: Wire the slug switch (app/games/[slug]/page.tsx)

1. `import <Name> from '@/games/<slug>/<Name>'`
2. Add to the switch: `{game.slug === '<slug>' && <<Name> />}`

## Step 4: OG image asset

Add `public/assets/img/og/<slug>_og.webp` and set `ogImage` on the registry entry to that path
and the file's real width and height. Cards, Open Graph tags, and JSON-LD read it from there.

## Step 5: Persistence

Persist progress in `localStorage` with a game-specific prefix to avoid collisions (e.g. `bj_*`,
`highlow-best-streak`). Load in a mount `useEffect`, save on change.

## Step 6: SEO content

Add a "How to Play" / rules section inside the component (see the bottom of `BlackJack.tsx` or
`HighLow.tsx`) so the page has unique copy.

## Step 7: Verify

- `npm test` passes (when the game has unit tests).
- `npm run lint` passes.
- `npm run dev`, open `/games/<slug>`, confirm the game renders (not just header/recommendations).
- Check a mobile viewport: the board fits without horizontal overflow and controls are usable.
- Confirm the card shows on `/`, `/games`, "You may also like", and `/sitemap.xml`.

## Reference

Full prose guide: [docs/adding-a-game.md](../../../docs/adding-a-game.md).
Architecture: [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md).
