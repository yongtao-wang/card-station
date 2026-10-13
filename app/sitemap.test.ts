import { describe, expect, it } from 'vitest'

import { games } from '../games/index'
import sitemap, { pageUpdatedAt } from './sitemap'

describe('sitemap', () => {
  it('keeps lastModified stable and tied to the stored dates', () => {
    const first = sitemap()
    const second = sitemap()

    expect(second).toEqual(first)

    const byUrl = new Map(first.map((entry) => [entry.url, entry.lastModified]))
    expect(byUrl.get('http://localhost:3000')).toBe(pageUpdatedAt.home)
    expect(byUrl.get('http://localhost:3000/about')).toBe(pageUpdatedAt.about)
    expect(byUrl.get('http://localhost:3000/games')).toBe(pageUpdatedAt.games)
    expect(byUrl.get('http://localhost:3000/contact')).toBe(pageUpdatedAt.contact)

    for (const game of games) {
      expect(byUrl.get(`http://localhost:3000/games/${game.slug}`)).toBe(
        game.updatedAt
      )
    }
  })
})
