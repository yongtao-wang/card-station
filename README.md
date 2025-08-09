# Flip Cardie

A playful collection of flip-card themed mini games built with Next.js and Tailwind CSS.

## Features
- App Router, SEO-friendly
- Cartoon-ish UI with Tailwind
- Pluggable mini-game structure under `games/`
- Per-game localStorage history
- Recommendation section

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm start` — start production server

## Develop
- Add new games under `games/<slug>` and register in `games/index.ts`.
- Each game should export a React component and manage its own localStorage keys.
