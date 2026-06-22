# Card Station — Agent Guide

Card Station is a free, mobile-friendly card-games site (Blackjack, Texas Hold'em vs Bot, Flip Card,
War, High Low, Snap). Stack: Next.js 16 (App Router) + React 18 + TypeScript + Tailwind CSS 3.
Games run entirely client-side (no backend/database), and the UI is responsive — it must work well
on phones as well as desktop. Deployed at https://cardstation.games.

## Commands

- `npm run dev` — start dev server on port 3000
- `npm run build` — production build
- `npm start` — start production server on port 3000
- `npm run lint` — ESLint (`eslint-config-next`)
- `npm test` — Vitest unit tests (`vitest run`)

Verify changes with `npm test`, `npm run lint`, and by loading the affected route.

## Repository layout

- `app/` — App Router routes, layouts, and SEO. Includes `app/api/contact/route.ts` (Resend email).
- `games/` — one folder per game (`games/<slug>/`) plus `games/index.ts`, the game registry.
- `components/` — shared UI (`Header`, `Footer`, `GameCard`, `Recommendation`, `PageTracker`, `AnimatedNumber`).
- `hooks/` — shared hooks (`usePageDuration`).
- `lib/site.ts` — site constants (name, url, author, locale).
- `styles/globals.css` — global styles; each game also has its own `*.module.css`.
- `vitest.config.ts` — Vitest config for colocated `*.test.ts` files.
- `public/assets/img/` — card SVGs (`cards/`) and per-game OG images (`og/`).

## Conventions

- Import aliases (see `tsconfig.json`): `@/components/*`, `@/games/*`, `@/lib/*`. App-internal
  imports use relative paths.
- Game components are client components — start the file with `'use client'`.
- Styling: Tailwind utility classes for layout; per-game visual styling lives in a CSS module
  (`games/<slug>/<name>.module.css`).
- Responsive / mobile-friendly is required, not optional. Design mobile-first and scale up with
  Tailwind `sm:` breakpoints (the default styles target mobile; `sm:` overrides target desktop).
  Layouts must fit small viewports without overflow; some elements adapt per device (e.g. Blackjack's
  `CARD_OFFSET_MOBILE`/`CARD_OFFSET_DESKTOP`, and the Hold'em table becomes a vertical stadium on
  mobile — see `.cursor/features/texas-holdem-layout.md`).
- Persistence: each game stores its own state in `localStorage` with a game-specific key prefix
  (e.g. `bj_playerChips`, `highlow-best-streak`). No backend/database.
- Cards: shared assets at `/assets/img/cards/<rank>_of_<suit>.svg` and `card_back.jpg`.
- Pure game logic: extract to a sibling `*.ts` module and colocate `*.test.ts` when rules are
  non-trivial (see `games/holdem/holdemHand.ts`). Run `npm test` before shipping.
- Do not add comments that merely narrate code (see workspace Karpathy rules). Keep changes surgical.

## Adding a game — touch-points

A new game must be wired in several places, or it will 404 or be missing from SEO/listings:

1. `games/<slug>/` — the game component (`'use client'`) + CSS module.
2. `games/index.ts` — add a `GameMeta` entry (`slug`, `title`, `description`, `emoji`).
3. `app/games/[slug]/page.tsx` — import the component, add it to the slug switch, and add an
   entry to the OG image map.
4. `components/GameCard.tsx` — add an entry to its OG image map.
5. `public/assets/img/og/<slug>_og.webp` — social/preview image.

`app/sitemap.ts`, the home page, `/games`, and `Recommendation` all read from `games/index.ts`
automatically once the registry entry exists.

See [.cursor/skills/add-new-game/SKILL.md](.cursor/skills/add-new-game/SKILL.md) and
[docs/adding-a-game.md](docs/adding-a-game.md).

## Gotchas

- Duplicate config files exist: `next.config.mjs` and `next.config.ts`, plus `postcss.config.cjs`
  and `postcss.config.js`. Next.js loads `next.config.mjs` (it wins over `.ts` when both exist), so
  edit the `.mjs`/`.cjs` files unless you intentionally consolidate them.
- `NEXT_PUBLIC_SITE_URL` gates absolute canonical URLs, OG image URLs, and JSON-LD `url` fields.
  When unset (local dev), those fall back to relative/undefined values — set it in `.env.local`.
- Secrets (`RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO`) live in `.env.local` and are read by
  `app/api/contact/route.ts`. Never commit them.
- The OG image map is duplicated in `app/games/[slug]/page.tsx` and `components/GameCard.tsx`;
  keep both in sync when adding games.

## More docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how rendering, the registry, game patterns, and SEO fit together.
- [docs/adding-a-game.md](docs/adding-a-game.md) — step-by-step game authoring guide.
