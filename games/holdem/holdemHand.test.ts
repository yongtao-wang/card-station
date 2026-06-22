import { describe, expect, it } from 'vitest'

import {
  type Card,
  cardKey,
  getBestHand,
  isWinningCard,
} from './holdemHand'

const c = (rank: Card['rank'], suit: Card['suit']): Card => ({ rank, suit })

describe('getBestHand', () => {
  it('returns all 5 community cards when the board is a flush', () => {
    const hole = [c('2', 'clubs'), c('3', 'diamonds')]
    const board = [
      c('A', 'hearts'),
      c('K', 'hearts'),
      c('Q', 'hearts'),
      c('J', 'hearts'),
      c('9', 'hearts'),
    ]

    const best = getBestHand(hole, board)

    expect(best.description).toBe('Flush')
    expect(best.cards).toHaveLength(5)
    expect(best.cards.every((card) => card.suit === 'hearts')).toBe(true)
    expect(hole.every((card) => !isWinningCard(card, best.cards))).toBe(true)
  })

  it('includes one hole card and four board cards for two pair', () => {
    const hole = [c('A', 'spades'), c('K', 'clubs')]
    const board = [
      c('A', 'hearts'),
      c('K', 'diamonds'),
      c('Q', 'clubs'),
      c('J', 'spades'),
      c('2', 'hearts'),
    ]

    const best = getBestHand(hole, board)

    expect(best.description).toBe('Two Pair')
    expect(best.cards).toHaveLength(5)
    expect(best.cards).toContainEqual(c('A', 'spades'))
    expect(best.cards).toContainEqual(c('A', 'hearts'))
    expect(best.cards).toContainEqual(c('K', 'clubs'))
    expect(best.cards).toContainEqual(c('K', 'diamonds'))
    expect(best.cards).toContainEqual(c('Q', 'clubs'))
  })

  it('returns the correct five cards for a full house', () => {
    const hole = [c('8', 'spades'), c('8', 'clubs')]
    const board = [
      c('8', 'hearts'),
      c('K', 'diamonds'),
      c('K', 'spades'),
      c('2', 'clubs'),
      c('3', 'hearts'),
    ]

    const best = getBestHand(hole, board)

    expect(best.description).toBe('Full House')
    expect(best.cards).toHaveLength(5)
    const ranks = best.cards.map((card) => card.rank).sort()
    expect(ranks.filter((r) => r === '8')).toHaveLength(3)
    expect(ranks.filter((r) => r === 'K')).toHaveLength(2)
  })

  it('plays the board when hole cards do not improve the hand', () => {
    const hole = [c('2', 'clubs'), c('3', 'diamonds')]
    const board = [
      c('A', 'spades'),
      c('K', 'spades'),
      c('Q', 'spades'),
      c('J', 'spades'),
      c('9', 'diamonds'),
    ]

    const best = getBestHand(hole, board)

    expect(best.description).toBe('High Card')
    expect(best.cards).toHaveLength(5)
    expect(board.every((card) => isWinningCard(card, best.cards))).toBe(true)
  })
})

describe('isWinningCard', () => {
  const winning = [
    c('A', 'hearts'),
    c('K', 'hearts'),
    c('Q', 'hearts'),
    c('J', 'hearts'),
    c('9', 'hearts'),
  ]

  it('matches by rank and suit', () => {
    expect(isWinningCard(c('A', 'hearts'), winning)).toBe(true)
    expect(isWinningCard(c('A', 'spades'), winning)).toBe(false)
  })

  it('uses cardKey for stable identity', () => {
    expect(cardKey(c('10', 'diamonds'))).toBe('diamonds-10')
  })
})
