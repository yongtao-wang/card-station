import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { games } from './index'

function webpSize(filePath: string) {
  const buf = readFileSync(filePath)
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') {
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    }
  }
  if (chunk === 'VP8 ') {
    const width = buf.readUInt16LE(26) & 0x3fff
    const height = buf.readUInt16LE(28) & 0x3fff
    return { width, height }
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    }
  }
  throw new Error(`unsupported webp chunk ${chunk} in ${filePath}`)
}

describe('game registry', () => {
  it('gives every game a unique description', () => {
    const descriptions = games.map((game) => game.description)
    const unique = new Set(descriptions)

    expect(unique.size).toBe(descriptions.length)
  })

  it('gives every seo description a unique value', () => {
    const descriptions = games
      .map((game) => game.seoDescription)
      .filter((description): description is string => description !== undefined)

    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('keeps rendered seo titles within 60 characters', () => {
    for (const game of games) {
      if (!game.seoTitle) continue
      const rendered = `${game.seoTitle} | Card Station`
      expect(rendered.length).toBeLessThanOrEqual(60)
    }
  })

  it('records each game OG image at its real pixel size', () => {
    const srcs = games.map((game) => game.ogImage.src)
    expect(new Set(srcs).size).toBe(srcs.length)

    for (const game of games) {
      expect(game.ogImage.src).toBe(`/assets/img/og/${game.slug}_og.webp`)
      expect(webpSize(`public${game.ogImage.src}`)).toEqual({
        width: game.ogImage.width,
        height: game.ogImage.height,
      })
    }
  })
})
