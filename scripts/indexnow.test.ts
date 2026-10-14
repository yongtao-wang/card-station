import { describe, expect, it } from 'vitest'

import { changedUrls, parseGameUpdatedAt, parsePageUpdatedAt } from './indexnow.mjs'

const gamesBefore = `
  { slug: 'war', title: 'War Card Game', updatedAt: '2026-10-13' },
  { slug: 'highlow', title: 'High Low', updatedAt: '2026-10-13' },
`

const gamesAfter = `
  { slug: 'war', title: 'War Card Game', updatedAt: '2026-10-14' },
  { slug: 'highlow', title: 'High Low', updatedAt: '2026-10-13' },
`

const pages = `
export const pageUpdatedAt = {
  home: '2026-10-13',
  about: '2026-10-13',
  games: '2026-10-13',
  contact: '2026-10-13',
} as const
`

describe('IndexNow changed URLs', () => {
  it('lists only pages whose updatedAt changed', () => {
    const urls = changedUrls(
      parseGameUpdatedAt(gamesBefore),
      parseGameUpdatedAt(gamesAfter),
      parsePageUpdatedAt(pages),
      parsePageUpdatedAt(pages)
    )

    expect(urls).toEqual(['https://www.cardstation.games/games/war'])
  })

  it('returns nothing when every date is unchanged', () => {
    const games = parseGameUpdatedAt(gamesBefore)
    const pagesParsed = parsePageUpdatedAt(pages)

    expect(changedUrls(games, games, pagesParsed, pagesParsed)).toEqual([])
  })

  it('includes a static page when its date changes', () => {
    const after = pages.replace("home: '2026-10-13'", "home: '2026-10-14'")
    const urls = changedUrls(
      parseGameUpdatedAt(gamesBefore),
      parseGameUpdatedAt(gamesBefore),
      parsePageUpdatedAt(pages),
      parsePageUpdatedAt(after)
    )

    expect(urls).toEqual(['https://www.cardstation.games'])
  })
})
