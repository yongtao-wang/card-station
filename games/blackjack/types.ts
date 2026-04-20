export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export const RANKS = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
] as const

export const PLAYER_INIT_CHIPS = 1000
export const DEALER_INIT_CHIPS = Number.MAX_SAFE_INTEGER

export const CARD_OFFSET_MOBILE = '-45px'
export const CARD_OFFSET_DESKTOP = '-70px'

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]

export interface Card {
  suit: Suit
  rank: Rank
  faceDown?: boolean
}

export type HandResult = 'pending' | 'busted' | 'stood' | 'blackjack' | 'surrendered'

export interface Hand {
  cards: Card[]
  bet: number
  result: HandResult
  isDoubled: boolean
}

export type GamePhase =
  | 'betting'
  | 'dealing'
  | 'player-turn'
  | 'player-busted'
  | 'dealer-revealing'
  | 'dealer-hitting'
  | 'resolving'
  | 'result'
  | 'insurance-prompt'
  | 'switching-hand'

export interface BlackjackState {
  phase: GamePhase
  deck: Card[]
  hands: Hand[]
  activeHandIndex: number
  dealerHand: Card[]
  playerChips: number
  betAmount: number
  insuranceBet: number
  wins: number
  losses: number
  message: string
  animationLock: boolean
  autoPlayEnabled: boolean
  showResetDropdown: boolean
  isClosingDropdown: boolean
}

export type GameAction =
  | { type: 'LOAD_SAVED_STATE'; chips: number; wins: number; losses: number }
  | { type: 'RESET_CHIPS' }
  | { type: 'ADD_TO_BET'; amount: number }
  | { type: 'START_HAND' }
  | { type: 'DEAL_CARD_TO_PLAYER'; card: Card }
  | { type: 'DEAL_CARD_TO_DEALER'; card: Card; faceDown?: boolean }
  | { type: 'DEALING_COMPLETE' }
  | { type: 'HIT'; card: Card }
  | { type: 'STAND' }
  | { type: 'DOUBLE_DOWN'; card: Card }
  | { type: 'SPLIT' }
  | { type: 'DEAL_CARD_TO_HAND'; handIndex: number; card: Card }
  | { type: 'SURRENDER' }
  | { type: 'TAKE_INSURANCE' }
  | { type: 'DECLINE_INSURANCE' }
  | { type: 'RESOLVE_INSURANCE' }
  | { type: 'REVEAL_DEALER_HOLE_CARD' }
  | { type: 'DEALER_HIT'; card: Card }
  | { type: 'DEALER_STAND' }
  | { type: 'RESOLVE_HAND' }
  | { type: 'RETURN_TO_BETTING' }
  | { type: 'SET_ANIMATION_LOCK'; locked: boolean }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'SET_CLOSING_DROPDOWN'; closing: boolean }
