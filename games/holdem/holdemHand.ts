export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A'

export interface Card {
  suit: Suit
  rank: Rank
}

export interface HandEvaluation {
  rank: number
  description: string
  values: number[]
  cards: Card[]
}

export const getCardValue = (rank: Rank): number => {
  if (rank === 'A') return 14
  if (rank === 'K') return 13
  if (rank === 'Q') return 12
  if (rank === 'J') return 11
  return parseInt(rank)
}

export const cardKey = (card: Card): string => `${card.suit}-${card.rank}`

export const isWinningCard = (card: Card, winningCards: Card[]): boolean =>
  winningCards.some((w) => cardKey(w) === cardKey(card))

const evaluateHand = (
  cards: Card[]
): Omit<HandEvaluation, 'cards'> => {
  if (cards.length < 5)
    return {
      rank: 0,
      description: 'High Card',
      values: cards.map((c) => getCardValue(c.rank)).sort((a, b) => b - a),
    }

  const sortedCards = [...cards].sort(
    (a, b) => getCardValue(b.rank) - getCardValue(a.rank)
  )
  const values = sortedCards.map((card) => getCardValue(card.rank))
  const suits = sortedCards.map((card) => card.suit)

  const valueCounts: { [key: number]: number } = {}
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1
  })

  const counts = Object.values(valueCounts).sort((a, b) => b - a)
  const isFlush = suits.every((suit) => suit === suits[0])
  const isStraight = values.every(
    (value, index) => index === 0 || value === values[index - 1] - 1
  )

  if (isFlush && isStraight && values[0] === 14) {
    return { rank: 9, description: 'Royal Flush', values }
  }

  if (isFlush && isStraight) {
    return { rank: 8, description: 'Straight Flush', values }
  }

  if (counts[0] === 4) {
    const quad = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 4)
    )
    const kicker = values.find((v) => v !== quad) || quad
    return { rank: 7, description: 'Four of a Kind', values: [quad, kicker] }
  }

  if (counts[0] === 3 && counts[1] === 2) {
    const trips = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 3)
    )
    const pair = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 2)
    )
    return { rank: 6, description: 'Full House', values: [trips, pair] }
  }

  if (isFlush) {
    return { rank: 5, description: 'Flush', values }
  }

  if (isStraight) {
    return { rank: 4, description: 'Straight', values }
  }

  if (counts[0] === 3) {
    const trips = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 3)
    )
    const kickers = values.filter((v) => v !== trips)
    return {
      rank: 3,
      description: 'Three of a Kind',
      values: [trips, ...kickers],
    }
  }

  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(valueCounts)
      .filter((k) => valueCounts[Number(k)] === 2)
      .map(Number)
      .sort((a, b) => b - a)
    const kicker =
      values.find((v) => v !== pairs[0] && v !== pairs[1]) || pairs[0]
    return { rank: 2, description: 'Two Pair', values: [...pairs, kicker] }
  }

  if (counts[0] === 2) {
    const pair = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 2)
    )
    const kickers = values.filter((v) => v !== pair)
    return { rank: 1, description: 'One Pair', values: [pair, ...kickers] }
  }

  return { rank: 0, description: 'High Card', values }
}

export function compareHandValues(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const va = a[i] ?? 0
    const vb = b[i] ?? 0
    if (va > vb) return 1
    if (va < vb) return -1
  }
  return 0
}

export const getBestHand = (
  playerCards: Card[],
  communityCards: Card[]
): HandEvaluation => {
  const allCards = [...playerCards, ...communityCards]
  let bestHand: HandEvaluation | null = null

  for (let i = 0; i < allCards.length - 4; i++) {
    for (let j = i + 1; j < allCards.length - 3; j++) {
      for (let k = j + 1; k < allCards.length - 2; k++) {
        for (let l = k + 1; l < allCards.length - 1; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const hand = [
              allCards[i],
              allCards[j],
              allCards[k],
              allCards[l],
              allCards[m],
            ]
            const evaluation = evaluateHand(hand)
            if (
              !bestHand ||
              evaluation.rank > bestHand.rank ||
              (evaluation.rank === bestHand.rank &&
                compareHandValues(evaluation.values, bestHand.values) > 0)
            ) {
              bestHand = { ...evaluation, cards: hand }
            }
          }
        }
      }
    }
  }

  return bestHand || { rank: -1, description: '', values: [], cards: [] }
}

export const getCurrentBestHand = (
  holeCards: Card[],
  communityCards: Card[]
): { description: string; rank: number } | null => {
  if (holeCards.length === 0) return null
  if (holeCards.length + communityCards.length >= 5) {
    const best = getBestHand(holeCards, communityCards)
    return { description: best.description, rank: best.rank }
  }
  const counts: { [value: number]: number } = {}
  ;[...holeCards, ...communityCards].forEach((c) => {
    const v = getCardValue(c.rank)
    counts[v] = (counts[v] || 0) + 1
  })
  const hasPair = Object.values(counts).some((n) => n >= 2)
  return hasPair
    ? { description: 'Pair', rank: 1 }
    : { description: 'High Card', rank: 0 }
}
