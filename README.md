# Card Station

A playful collection of card games built with Next.js and Tailwind CSS.

## Live Website

Visit the live site here: [https://cardstation.games](https://cardstation.games)

## Features

- App Router, SEO-friendly
- Cartoon-ish UI with Tailwind
- Pluggable mini-game structure under `games/`
- Per-game localStorage history
- Recommendation section
- Dynamic metadata & sitemap for SEO

## SEO

Set `NEXT_PUBLIC_SITE_URL` in your environment (e.g. `.env.local`) to enable canonical URLs & structured data.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run test:watch` — Vitest watch mode

## Develop

- Add new games under `games/<slug>` and register in `games/index.ts`.
- Each game should export a React component and manage its own localStorage keys.
