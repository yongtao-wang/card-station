# SEO — Reference

Status board: [backlog-master-list.md](backlog-master-list.md). This doc holds the context and full ticket details.

## Baseline (2026-10-13)

Sources: Google Search Console export (last 3 months, web search) and Vercel Web Analytics (last 30
days, production). The Vercel MCP analytics tools return "Web Analytics not found"; the CLI works:

```sh
vercel api "/v1/query/web-analytics/visits/aggregate?projectId=prj_eUU9zEv6fVuQ0ljRMnIKZrYF7Z6u&teamId=team_F06qouEmitNzudk8hvhTCgrd&by=requestPath&since=<ISO>&until=<ISO>&limit=20" --method GET
```

The free plan keeps 30 days of history, so snapshot it monthly ([SEO-21](#seo-21)).

### Traffic sources (Vercel, 30 days)

| Source | Visitors |
| --- | --- |
| Bing ecosystem (bing.com, DuckDuckGo, Yahoo, Ecosia, MSN, cn.bing) | ~400 |
| No referrer (direct, bookmarks, apps) | 312 |
| google.com | 47 |

Devices: desktop 521, mobile 164, tablet 17.

| Page | Visitors (all) | From Bing | From Google |
| --- | --- | --- | --- |
| /games/blackjack | 188 | 68 | 3 |
| /games/holdem | 154 | 68 | 6 |
| /games/flipcard | 130 | 62 | 4 |
| / | 129 | 3 | 2 |
| /games/highlow | 87 | 27 | 8 |
| /games/snap | 87 | 42 | 21 |
| /games/war | 23 | 3 | 2 |

### Google Search Console (3 months)

114 clicks, 4,559 impressions, average position ~30. Monthly clicks: Jul 15 → Aug 34 → Sep 49.
Desktop: avg position 31; mobile: 20.

| Game | Representative queries | Position | Read |
| --- | --- | --- | --- |
| Snap | "snap card game online", "play snap online" | 6–10 | Only page-1 page; 62 of 114 clicks |
| High Low | "high low predictions" 9, "high low card game online" 17 (97 impr, 0 clicks) | 9–17 | Near page-1 |
| War | "war card game online" (210 impr) | 22 | Biggest page-2 opportunity |
| Hold'em | "card games texas holdem" 42, "texas holdem vs computer" 41, "bot for texas holdem" 26, "texas holdem vs bots" 10 | 10–42 | "vs computer / bot / simulator" is reachable; head term is not |
| Blackjack | "free card game blackjack" etc. (~800 impr) | 45–50 | Competing with Arkadium; long-term |
| Flip Card | "flip card game", "card flip game" | ~47 | Keyword mismatch: the game is a memory/matching game |
| Brand | "cardstation" | 7 | Brand query should be #1 |

### Takeaways

1. Bing sends ~8× more search traffic than Google. Bing indexing hygiene (Webmaster Tools, IndexNow,
   sitemap dates, structured data) is the highest-leverage work.
2. Bing already likes Blackjack, Hold'em, and Flip Card. Change their titles one batch at a time and
   measure between batches (2–3 weeks) so a regression can't hit all three at once.
3. On Google, War, High Low, and Snap are closest to page 1 — retarget and add content there first.

## Phase 1 — Technical fixes + Bing indexing

<a id="seo-01"></a>
### SEO-01 — Render JSON-LD as real `<script>` tags

**Automation:** Full · **Impact:** High · **Effort:** S · **Priority:** P0

- **Problem:** Per-game, `/games` ItemList, and contact FAQ JSON-LD use `next/script`, which injects
  them client-side. The live HTML contains them only inside the RSC payload, not as
  `<script type="application/ld+json">`. Only the root `WebSite` block (plain `<script>`) renders.
- **Where:** `app/games/[slug]/page.tsx:86`, `app/games/page.tsx:76`, `app/contact/page.tsx:38`.
- **Fix:** Replace with plain `<script type='application/ld+json' dangerouslySetInnerHTML={…} />`.
- **Human input:** None.
- **Impact rationale:** Structured data on every game page is currently invisible to crawlers that
  don't run JS reliably; Bing (~8× Google's traffic) leans on it. Prerequisite for SEO-07 and rich results.
- **Effort rationale:** agent ~20 min (3 files); human: diff review.
- **Done when:** `curl` of each page shows the JSON-LD as a real tag; Rich Results Test parses it.

<a id="seo-02"></a>
### SEO-02 — Fix broken `/games/texas-holdem` link

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** `app/games/page.tsx:126` links to `/games/texas-holdem`, which returns 404. Slug is `holdem`.
- **Fix:** Point the link at `/games/holdem`.
- **Human input:** None.
- **Impact rationale:** One broken internal link on a low-traffic page (`/games`, 18 visitors/30d).
- **Effort rationale:** agent ~2 min. Bundle with SEO-01.
- **Done when:** link resolves to the Hold'em page.

<a id="seo-03"></a>
### SEO-03 — Remove fake `SearchAction`

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** `WebSite` JSON-LD declares a sitelinks search at `/?q=`, but there is no search and
  `public/robots.txt` disallows `/?q=`.
- **Where:** `app/layout.tsx:112`.
- **Fix:** Remove `potentialAction`.
- **Human input:** None.
- **Impact rationale:** Invalid structured data; small risk of being ignored, no ranking upside.
- **Effort rationale:** agent ~2 min. Bundle with SEO-01.
- **Done when:** `potentialAction` is gone from the rendered JSON-LD.

<a id="seo-04"></a>
### SEO-04 — Remove doubled brand in page titles

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** Root `title.template` appends `| Card Station`, so live titles read
  "Contact Us — Card Station | Card Station" and "About Card Station — Free Online Card Games | Card Station".
- **Where:** `app/about/page.tsx:5`, `app/contact/page.tsx:7` (and its OG/Twitter titles).
- **Fix:** Drop the brand from page-level titles.
- **Human input:** None.
- **Impact rationale:** About/contact get ~30 visitors/30d combined; cosmetic in SERPs.
- **Effort rationale:** agent ~5 min.
- **Done when:** no rendered `<title>` contains "Card Station" twice.

<a id="seo-05"></a>
### SEO-05 — Fix nested links on `/games`

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** `app/games/page.tsx:105` wraps `<GameCard>` in `<Link>`; `GameCard` already renders a
  `<Link>`. Nested `<a>` is invalid HTML.
- **Fix:** Remove the outer `<Link>`.
- **Human input:** None.
- **Impact rationale:** HTML validity; crawlers handle it, little measurable effect.
- **Effort rationale:** agent ~5 min.
- **Done when:** one anchor per card.

<a id="seo-06"></a>
### SEO-06 — Real `lastModified` dates in sitemap

**Automation:** Full · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Problem:** `app/sitemap.ts:7` uses `new Date()`, so every URL looks changed on every build.
  Search engines (Bing especially) learn to ignore untrustworthy `lastmod`.
- **Fix:** Per-page date that changes only when content changes (e.g. `updatedAt` in
  `games/index.ts`, constants for static pages), or omit `lastModified`.
- **Human input:** None.
- **Impact rationale:** Makes recrawl signals trustworthy for Bing and pairs with IndexNow (SEO-14).
- **Effort rationale:** agent ~20 min.
- **Done when:** two consecutive builds produce identical sitemap dates.

<a id="seo-07"></a>
### SEO-07 — Richer structured data

**Automation:** Full · **Impact:** Medium · **Effort:** M · **Priority:** P2

- **Problem:** Game pages use a bare `Game` type; no breadcrumbs; no `Organization`, and the brand
  query "cardstation" ranks only #7.
- **Fix:**
  - Game pages: `VideoGame` (or `WebApplication`) with `applicationCategory: "GameApplication"`,
    `gamePlatform: "Web browser"`, `offers: { price: 0, priceCurrency: "USD" }`, correct `image`.
  - `BreadcrumbList` on game pages: Home › Games › <Game>.
  - `Organization` (name "Card Station", `url`, `logo`) in the root layout.
- **Human input:** None.
- **Impact rationale:** Can earn breadcrumb display in results and help brand recognition; rich
  results for games aren't guaranteed, so Medium.
- **Effort rationale:** agent ~1–2h including validation.
- **Depends on:** SEO-01, SEO-08.
- **Done when:** Schema validator shows no errors on `/`, `/games`, and one game page.

<a id="seo-08"></a>
### SEO-08 — Move OG image map into the game registry

**Automation:** Full · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Problem:** The OG image map is duplicated (`app/games/[slug]/page.tsx` ×2, `components/GameCard.tsx`,
  `app/games/page.tsx`), and two copies only contain `holdem`, so every game's JSON-LD `image` points
  to the Hold'em image. Declared OG dimensions (1200×630) don't match the files (300×180 – 500×300).
- **Fix:** Add `ogImage` (with real `width`/`height`) to `GameMeta`; read it everywhere. Update the
  touch-points in `AGENTS.md` and `docs/adding-a-game.md`.
- **Human input:** None.
- **Impact rationale:** Five of six games advertise the wrong image to search engines; also removes a
  maintenance trap for new games.
- **Effort rationale:** agent ~45 min (5 files + docs).
- **Done when:** one source of truth; each game's JSON-LD and OG tags reference its own image.

<a id="seo-14"></a>
### SEO-14 — IndexNow: key file + ping on deploy

**Automation:** Partial · **Impact:** High · **Effort:** S · **Priority:** P0

- **Problem:** Bing is the main traffic source, but changes are only discovered on Bing's own crawl
  schedule.
- **Fix:** Generate a key, add `public/<key>.txt`, and add a script (e.g. `npm run indexnow`) that
  POSTs the sitemap URLs to `https://api.indexnow.org/indexnow`.
- **Human input:** Decide how the ping runs — manually after deploy, or a Vercel deploy hook /
  GitHub Action (you may need to add a secret or hook in the dashboard).
- **Impact rationale:** Bing, Yandex, Seznam, Naver pick up changes within hours; every later SEO
  change lands faster on the engine that sends ~400 visitors/30d.
- **Effort rationale:** agent ~30 min; human ~10 min to choose and wire the trigger.
- **Done when:** a ping returns 200/202 and Bing Webmaster Tools shows IndexNow submissions.

<a id="seo-22"></a>
### SEO-22 — Set up Bing Webmaster Tools

**Automation:** Manual · **Impact:** High · **Effort:** S · **Priority:** P0

- **Problem:** No visibility into the engine that sends most search traffic.
- **Fix:** Import the site from Google Search Console (one click), submit
  `https://www.cardstation.games/sitemap.xml`, check the Site Scan / SEO reports.
- **Human input:** All of it — requires your Microsoft account. Afterwards, share the Bing
  query/page report so it can be added to the baseline.
- **Impact rationale:** Unlocks Bing query data and crawl diagnostics; needed to verify SEO-14.
- **Effort rationale:** human ~15 min.
- **Done when:** site verified, sitemap shows as processed.

<a id="seo-23"></a>
### SEO-23 — Make apex → www redirect permanent (308)

**Automation:** Manual · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Problem:** `https://cardstation.games/` → `www` returns **307** (temporary). `http://cardstation.games/`
  takes two hops (308 → https apex → 307 → www).
- **Fix:** Vercel → Project → Settings → Domains: set the apex to redirect to `www` with 308.
- **Human input:** Dashboard change (agent can verify afterwards with `curl`).
- **Impact rationale:** Consolidates any signals pointing at the apex onto `www`; how many links use
  the apex is unknown, so Medium.
- **Effort rationale:** human ~5 min.
- **Done when:** `curl -sI https://cardstation.games/` shows `308`.

<a id="seo-24"></a>
### SEO-24 — Validate rich results and request re-crawl

**Automation:** Manual · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Fix:** Run key pages through Google's Rich Results Test, then URL Inspection → Request indexing
  (Google) and URL Submission (Bing) for the game pages.
- **Human input:** Requires your Search Console / Bing accounts.
- **Impact rationale:** Speeds up pickup of SEO-01/07 and confirms they parse; no direct ranking effect.
- **Effort rationale:** human ~15 min.
- **Depends on:** SEO-01, SEO-07 shipped.
- **Done when:** no structured-data errors reported; re-crawl requested for all game pages.

## Phase 2 — Per-page retargeting and content

Rules for this phase:

- Keep URLs/slugs unchanged.
- Ship one batch, wait 2–3 weeks, compare against the baseline (SEO-21), then ship the next.
- Agent drafts titles, H1s, and descriptions from the query data; you approve before merge.

<a id="seo-15"></a>
### SEO-15 — Retarget batch A: War, High Low

**Automation:** Partial · **Impact:** High · **Effort:** S · **Priority:** P0

- **Problem:** Titles/descriptions don't use the phrases people search; both pages sit just off page 1.
- **Fix:**
  - **War:** title along the lines of "War Card Game Online — Play Free vs Computer"; description
    using "war card game online / free / play".
  - **High Low:** "High Low Card Game Online — Higher or Lower"; cover "high low predictions",
    "higher or lower card game".
  - Add `seoTitle`/`seoDescription` to `GameMeta` (keep `title`/`description` for UI) and read them
    in `generateMetadata`.
- **Human input:** Approve the drafted copy.
- **Impact rationale:** War: "war card game online" 210 impressions at position 22. High Low:
  positions 9–17 with 0 clicks on "high low card game online". Page-1 moves are realistic.
- **Effort rationale:** agent ~30 min; human ~10 min review.
- **Done when:** new titles live; snapshot taken for comparison after 2–3 weeks.

<a id="seo-16"></a>
### SEO-16 — Retarget batch B: Hold'em, Flip Card

**Automation:** Partial · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Fix:**
  - **Hold'em:** lean into "Texas Hold'em vs Computer — Free Poker Bot / Simulator".
  - **Flip Card:** "Flip Card — Memory Matching Game"; add "memory / matching pairs / concentration".
- **Human input:** Approve the drafted copy.
- **Impact rationale:** Google upside is real ("texas holdem vs bots" at 10, "bot for texas holdem"
  at 26) but these pages bring ~130 Bing visitors/30d today, so there is downside risk. Medium.
- **Effort rationale:** agent ~30 min; human ~10 min.
- **Depends on:** SEO-15 shipped and measured (2–3 weeks).
- **Done when:** new titles live; Bing traffic to both pages checked after 2–3 weeks.

<a id="seo-17"></a>
### SEO-17 — Retarget batch C: Snap, Blackjack

**Automation:** Partial · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:**
  - **Snap:** keep the title (ranks 6–10); tune the description only if CTR is weak.
  - **Blackjack:** "Free Blackjack Online — Play vs Dealer, No Download".
- **Human input:** Approve the drafted copy.
- **Impact rationale:** Snap already works; Blackjack sits at position 45–50 against strong
  competitors, so title changes alone won't move it much.
- **Effort rationale:** agent ~20 min; human ~10 min.
- **Depends on:** SEO-16 measured.
- **Done when:** changes live and measured.

<a id="seo-18"></a>
### SEO-18 — Per-game FAQ / rules / strategy content

**Automation:** Partial · **Impact:** High · **Effort:** L · **Priority:** P1

- **Problem:** Game pages have little unique text; Flip Card and High Low are the thinnest.
- **Fix:** Each game page gets server-rendered "How to play", "Tips/strategy", and 3–5 FAQ entries
  with matching `FAQPage` JSON-LD. Link contextually to related games (War ↔ High Low,
  Hold'em ↔ Blackjack). Order: War, High Low, Snap, then Hold'em (hand rankings table), Blackjack
  (basic strategy chart), Flip Card.
- **Human input:** Review copy for tone and accuracy.
- **Impact rationale:** Content depth is the main lever for the page-2/3 pages; Blackjack and
  Hold'em (~1,600 impressions combined) can't climb without it.
- **Effort rationale:** agent ~1h per game (6 games); human ~15 min review per game.
- **Done when:** all six pages have the sections and valid `FAQPage` JSON-LD.

<a id="seo-19"></a>
### SEO-19 — High Low: show next-card odds

**Automation:** Partial · **Impact:** Medium · **Effort:** M · **Priority:** P2

- **Problem:** Queries like "hi low predictions" (position ~9) suggest people want probabilities.
- **Fix:** Show "Higher: 62% · Lower: 31%" for the remaining deck. Pure logic in a sibling `*.ts`
  module with tests, then UI.
- **Human input:** Product decision — does it spoil the game? Always on, or a toggle?
- **Impact rationale:** Matches search intent and adds unique, useful content; effect on ranking is
  uncertain.
- **Effort rationale:** agent ~2–3h; human ~10 min decision.
- **Done when:** odds shown per your decision; logic covered by tests.

## Phase 3 — Polish

<a id="seo-09"></a>
### SEO-09 — One visible `<h1>` per game page

**Automation:** Full · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Problem:** `app/games/[slug]/page.tsx:97` renders an `<h1>` inside `hidden sm:flex` (invisible on
  mobile, which Google indexes), and Blackjack, Snap, Hold'em, War render a second `<h1>` in-game.
- **Fix:** Keep one `<h1>` visible on all breakpoints; demote the other to `<h2>`/`<p>`.
- **Human input:** None (UI change is small; review the mobile header visually).
- **Impact rationale:** The H1 is a primary on-page signal and Google indexes the mobile version.
- **Effort rationale:** agent ~30 min across 5 files.
- **Done when:** each game page has exactly one `<h1>`, visible at mobile and desktop widths.

<a id="seo-10"></a>
### SEO-10 — Internal links

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:** Header nav: add "Games" (`/games`). Footer: a link per game (from the registry). Home
  "Now Trending" tiles (`app/page.tsx`) are empty `<Link>`s — add text or `aria-label`.
- **Human input:** None.
- **Impact rationale:** Small site with few pages; every game is already linked from home.
- **Effort rationale:** agent ~30 min.
- **Done when:** nav, footer, and tiles render with anchor text.

<a id="seo-11"></a>
### SEO-11 — Low-contrast text

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** `app/games/page.tsx` and `app/not-found.tsx` use `text-slate-600` / light `bg-slate-100`
  sections on the dark theme.
- **Fix:** Match the colors used elsewhere on the site.
- **Human input:** None.
- **Impact rationale:** Accessibility and Lighthouse score; minor SEO effect.
- **Effort rationale:** agent ~20 min.
- **Done when:** text passes WCAG AA contrast on both pages.

<a id="seo-12"></a>
### SEO-12 — Web manifest + apple-touch-icon

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:** Icons exist in `public/assets/icons/`. Add `app/manifest.ts` and the touch icon to root metadata.
- **Human input:** None.
- **Impact rationale:** Polish for home-screen installs; negligible ranking effect.
- **Effort rationale:** agent ~15 min.
- **Done when:** `/manifest.webmanifest` serves and the touch icon is in `<head>`.

<a id="seo-13"></a>
### SEO-13 — Fix domain in AGENTS.md

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:** AGENTS.md says `https://cardstation.games`; the canonical domain is `https://www.cardstation.games`.
- **Human input:** None.
- **Impact rationale:** Doc accuracy only.
- **Effort rationale:** agent ~1 min.
- **Done when:** AGENTS.md shows the `www` domain.

<a id="seo-26"></a>
### SEO-26 — Guard against duplicate game descriptions

**Automation:** Full · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Fix:** Vitest test that fails if two entries in `games/index.ts` share a `description` (or
  `seoDescription`, once SEO-15 adds it).
- **Human input:** None.
- **Impact rationale:** Prevents a future problem; no current duplicates.
- **Effort rationale:** agent ~10 min.
- **Done when:** test exists and passes.

<a id="seo-20"></a>
### SEO-20 — Correct About page claims

**Automation:** Partial · **Impact:** Low · **Effort:** S · **Priority:** P2

- **Problem:** `app/about/page.tsx` mentions Framer Motion animations, drag-and-drop, and challenging
  friends; `framer-motion` isn't a dependency and there's no multiplayer.
- **Fix:** Rewrite to describe the site accurately.
- **Human input:** Confirm the facts (what you want said about the project and yourself).
- **Impact rationale:** Trust signal; 16 visitors/30d.
- **Effort rationale:** agent ~20 min; human ~10 min.
- **Done when:** every claim on the page is true.

<a id="seo-25"></a>
### SEO-25 — Produce 1200×630 OG images

**Automation:** Manual · **Impact:** Low · **Effort:** M · **Priority:** P3

- **Problem:** OG images are 300×180 – 500×300. Social previews look blurry; Google Discover needs
  ≥1200px wide.
- **Fix:** Replace `public/assets/img/og/<slug>_og.webp` at 1200×630, then update SEO-08's
  width/height values.
- **Human input:** Design the images. Alternative: the agent builds a generated OG route (`next/og`,
  title + emoji + background) — that would make this ticket Partial (you pick the look).
- **Impact rationale:** Traffic is almost all search, not social.
- **Effort rationale:** human ~1h for six images.
- **Done when:** all six images are 1200×630 and the metadata matches.

## Ongoing

<a id="seo-21"></a>
### SEO-21 — Monthly metrics snapshot

**Automation:** Partial · **Impact:** Medium · **Effort:** S · **Priority:** P1

- **Fix:** Agent pulls Vercel analytics via the CLI command above, appends a dated snapshot section
  to this doc, and compares against the baseline.
- **Human input:** Export Google Search Console (Performance, last 28 days) and Bing Webmaster
  Tools reports each month.
- **Impact rationale:** Without it, Phase 2's measure-between-batches rule can't work, and Vercel's
  free plan drops data after 30 days.
- **Effort rationale:** agent ~20 min/month; human ~10 min/month.
- **Done when:** recurring — one snapshot per month.
