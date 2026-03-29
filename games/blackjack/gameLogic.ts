import { Card, Rank, SUITS, RANKS } from './types'

export function getCardSvgPath(card: Card) {
  const rankMap: Record<Rank, string> = {
    A: 'ace',
    K: 'king',
    Q: 'queen',
    J: 'jack',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2',
  }
  return `/assets/img/cards/${rankMap[card.rank]}_of_${card.suit}.svg`
}

export function getCardValue(card: Card): number {
  if (card.rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(card.rank)) return 10
  return parseInt(card.rank)
}

export function calculateHandValue(hand: Card[]): number {
  let value = hand.reduce((sum, card) => sum + getCardValue(card), 0)
  let aces = hand.filter((card) => card.rank === 'A').length
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  return value
}

export function isSoft(hand: Card[]): boolean {
  // A hand is soft if it has an ace AND at least one ace is counted as 11
  const hasAce = hand.some((c) => c.rank === 'A')
  if (!hasAce) return false
  // Calculate value treating all aces as 1
  const hardValue = hand.reduce((sum, c) => {
    if (c.rank === 'A') return sum + 1
    return sum + getCardValue(c)
  }, 0)
  // If adding 10 (making one ace worth 11) keeps us at 21 or under, it's soft
  return hardValue + 10 <= 21
}

function upcardValue(upcard?: Card): number {
  if (!upcard) return 10
  return getCardValue(upcard)
}

export function basicStrategyDecision(
  playerHand: Card[],
  dealerUpcard?: Card
): 'hit' | 'stand' {
  const total = calculateHandValue(playerHand)
  const soft = isSoft(playerHand)
  const d = upcardValue(dealerUpcard)

  if (!soft) {
    if (total >= 17) return 'stand'
    if (total >= 13 && total <= 16) return d >= 2 && d <= 6 ? 'stand' : 'hit'
    if (total === 12) return d >= 4 && d <= 6 ? 'stand' : 'hit'
    return 'hit'
  } else {
    if (total >= 19) return 'stand'
    if (total === 18) {
      if (d === 2 || d === 7 || d === 8) return 'stand'
      return 'hit'
    }
    return 'hit'
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceDown: false })
    }
  }
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Pre-compute the dealer's hits: returns the cards the dealer will draw */
export function computeDealerHits(
  dealerHand: Card[],
  deck: Card[]
): { hits: Card[]; remainingDeck: Card[] } {
  let currentValue = calculateHandValue(dealerHand)
  const hits: Card[] = []
  let deckIdx = 0

  while (currentValue < 17 && deckIdx < deck.length) {
    const card = { ...deck[deckIdx], faceDown: false }
    hits.push(card)
    currentValue = calculateHandValue([...dealerHand, ...hits])
    deckIdx++
  }

  return { hits, remainingDeck: deck.slice(deckIdx) }
}
