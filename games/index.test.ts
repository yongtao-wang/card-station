import { describe, expect, it } from 'vitest'

import { games } from './index'

describe('game registry', () => {
  it('gives every game a unique description', () => {
    const descriptions = games.map((game) => game.description)
    const unique = new Set(descriptions)

    expect(unique.size).toBe(descriptions.length)
  })
})
