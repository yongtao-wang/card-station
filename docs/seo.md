# SEO — Reference

Baseline data and working rules for SEO work. The work itself is tracked as GitHub issues with an
`SEO:` title prefix (`gh issue list --search "SEO in:title"`).

## Baseline (2026-10-13)

Sources: Google Search Console export (last 3 months, web search) and Vercel Web Analytics (last 30
days, production). The Vercel MCP analytics tools return "Web Analytics not found"; the CLI works:

```sh
vercel api "/v1/query/web-analytics/visits/aggregate?projectId=prj_eUU9zEv6fVuQ0ljRMnIKZrYF7Z6u&teamId=team_F06qouEmitNzudk8hvhTCgrd&by=requestPath&since=<ISO>&until=<ISO>&limit=20" --method GET
```

The free plan keeps 30 days of history, so snapshot it monthly ([#24](https://github.com/yongtao-wang/card-station/issues/24)).

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

## Retargeting rules

For the title and description retargeting issues:

- Keep URLs/slugs unchanged.
- Ship one batch, wait 2–3 weeks, compare against the baseline ([#24](https://github.com/yongtao-wang/card-station/issues/24)), then ship the next.
- Agent drafts titles, H1s, and descriptions from the query data; you approve before merge.
- Don't ship on-page changes to a batch's pages during its measurement window: finish [#9](https://github.com/yongtao-wang/card-station/issues/9) (H1s)
  before batch A, and add [#23](https://github.com/yongtao-wang/card-station/issues/23) content to a batch's pages only after that batch is measured.
- Judge batches on impressions and average position per query, not clicks — War gets ~2 Google
  visitors/30d, so click counts are noise.
- Keep the rendered `<title>` (including the `| Card Station` suffix) around 60 characters.
