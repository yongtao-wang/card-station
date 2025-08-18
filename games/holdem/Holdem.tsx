'use client'

import { useCallback, useEffect, useState } from 'react'

// Card types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank =
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

interface Card {
  suit: Suit
  rank: Rank
}

type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'gameOver'
type PlayerAction = 'fold' | 'call' | 'raise' | 'check' | 'allIn'

interface Player {
  id: string
  name: string
  chips: number
  cards: Card[]
  currentBet: number
  hasActed: boolean
  hasFolded: boolean
  isAllIn: boolean
}

interface GameState {
  phase: GamePhase
  pot: number
  communityCards: Card[]
  currentPlayer: string
  players: Player[]
  dealer: string
  smallBlind: number
  bigBlind: number
  minRaise: number
  winner: string | null
  winningHand: string | null
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = [
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
]

const createDeck = (): Card[] => {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getSuitEmoji = (suit: Suit): string => {
  switch (suit) {
    case 'hearts':
      return '♥️'
    case 'diamonds':
      return '♦️'
    case 'clubs':
      return '♣️'
    case 'spades':
      return '♠️'
  }
}

const getCardValue = (rank: Rank): number => {
  if (rank === 'A') return 14
  if (rank === 'K') return 13
  if (rank === 'Q') return 12
  if (rank === 'J') return 11
  return parseInt(rank)
}

// Returns hand rank, description, and sorted values for tie-breaking
const evaluateHand = (
  cards: Card[]
): { rank: number; description: string; values: number[] } => {
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

  // Count occurrences
  const valueCounts: { [key: number]: number } = {}
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1
  })

  const counts = Object.values(valueCounts).sort((a, b) => b - a)
  const isFlush = suits.every((suit) => suit === suits[0])
  const isStraight = values.every(
    (value, index) => index === 0 || value === values[index - 1] - 1
  )

  // Royal Flush
  if (isFlush && isStraight && values[0] === 14) {
    return { rank: 9, description: 'Royal Flush', values }
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return { rank: 8, description: 'Straight Flush', values }
  }

  // Four of a Kind
  if (counts[0] === 4) {
    // Find quad value and kicker
    const quad = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 4)
    )
    const kicker = values.find((v) => v !== quad) || quad
    return { rank: 7, description: 'Four of a Kind', values: [quad, kicker] }
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const trips = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 3)
    )
    const pair = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 2)
    )
    return { rank: 6, description: 'Full House', values: [trips, pair] }
  }

  // Flush
  if (isFlush) {
    return { rank: 5, description: 'Flush', values }
  }

  // Straight
  if (isStraight) {
    return { rank: 4, description: 'Straight', values }
  }

  // Three of a Kind
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

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(valueCounts)
      .filter((k) => valueCounts[Number(k)] === 2)
      .map(Number)
      .sort((a, b) => b - a)
    const kicker =
      values.find((v) => v !== pairs[0] && v !== pairs[1]) || pairs[0]
    return { rank: 2, description: 'Two Pair', values: [...pairs, kicker] }
  }

  // One Pair
  if (counts[0] === 2) {
    const pair = Number(
      Object.keys(valueCounts).find((k) => valueCounts[Number(k)] === 2)
    )
    const kickers = values.filter((v) => v !== pair)
    return { rank: 1, description: 'One Pair', values: [pair, ...kickers] }
  }

  // High Card
  return { rank: 0, description: 'High Card', values }
}

const getBestHand = (
  playerCards: Card[],
  communityCards: Card[]
): { rank: number; description: string; values: number[] } => {
  const allCards = [...playerCards, ...communityCards]
  let bestHand: { rank: number; description: string; values: number[] } | null =
    null

  // Try all combinations of 5 cards from the 7 available
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
              bestHand = evaluation
            }
          }
        }
      }
    }
  }

  return bestHand || { rank: -1, description: '', values: [] }
}

// Compare two hand values arrays for tie-breaking
function compareHandValues(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const va = a[i] ?? 0
    const vb = b[i] ?? 0
    if (va > vb) return 1
    if (va < vb) return -1
  }
  return 0
}

// ---- 1) Simple preflop hand grouping ----
function preflopGroup(a: Card, b: Card): number {
  // 0 -> strongest, 5 -> weakest
  const ranks = [
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
  const v = (r: Rank) => ranks.indexOf(r)
  const high = Math.max(v(a.rank), v(b.rank))
  const low = Math.min(v(a.rank), v(b.rank))
  const suited = a.suit === b.suit
  const pair = a.rank === b.rank
  const gap = high - low

  if (pair && v(a.rank) >= v('10')) return 0 // TT, JJ, QQ, KK, AA
  if ((pair && v(a.rank) >= v('7')) || (suited && high >= v('Q') && gap <= 1))
    return 1 // 77-99, QJs/KQs/AQs
  if (
    (suited && high >= v('10') && gap <= 2) ||
    (high >= v('K') && low >= v('10'))
  )
    return 2 // TJs/QTs/KTo+
  if (pair) return 3 // 22-66
  if (suited && gap <= 3 && high >= v('9')) return 3 // 98s, T8s
  if (high >= v('Q')) return 4 // Qx 杂花
  return 5
}

// ---- 2) Estimate postflop hand strength (quick approximation, not true equity) ----
function postflopStrengthRank(my: Card[], board: Card[]): number {
  return evaluateHand([...my, ...board]).rank // 0~9
}

// ---- 3) (Optional) Monte Carlo estimate of equity vs 1 opponent ----
function estimateEquityVsOne(
  my: Card[],
  board: Card[],
  unseen: Card[],
  trials = 250
): number {
  if (board.length === 5) {
    const myEval = getBestHand(my, board).rank
    return myEval >= 0 ? 1 : 0.5
  }

  let win = 0,
    tie = 0
  for (let t = 0; t < trials; t++) {
    const pool = [...unseen]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }

    const opp = [pool[0], pool[1]]
    let simBoard = [...board]
    let idx = 2

    while (simBoard.length < 5) simBoard.push(pool[idx++])

    const meHand = getBestHand(my, simBoard)
    const opHand = getBestHand(opp, simBoard)
    if (meHand.rank > opHand.rank) win++
    else if (meHand.rank === opHand.rank) tie++
  }
  return (win + tie * 0.5) / trials
}

// ---- 4) Main strategy：compare equity with pot odds, and take action ----
function chooseActionByEquity(
  equity: number,
  pot: number,
  callAmount: number,
  canCheck: boolean,
  stacks: { my: number; opp: number },
  minRaise: number
): { action: PlayerAction; amount?: number } {
  const potOdds = callAmount > 0 ? callAmount / (pot + callAmount) : 0
  const margin = 0.05
  const rnd = Math.random()

  if (callAmount === 0) {
    if (equity > 0.7 && stacks.my >= minRaise && rnd < 0.7) {
      const bet = Math.max(minRaise, Math.min(stacks.my, Math.floor(pot * 0.5)))
      return { action: 'raise', amount: bet }
    }
    return { action: 'check' }
  }

  if (equity > potOdds + margin) {
    if (equity > 0.75 && stacks.my < 3 * callAmount && rnd < 0.3) {
      return { action: 'allIn' }
    }
    const raiseTo = Math.max(
      minRaise,
      Math.min(stacks.my, Math.floor(callAmount * (2 + rnd)))
    )
    if (raiseTo >= minRaise && rnd < 0.5) {
      return { action: 'raise', amount: raiseTo }
    }
    return { action: 'call' }
  }

  if (equity < potOdds - margin) {
    return canCheck ? { action: 'check' } : { action: 'fold' }
  }

  if (rnd < 0.1 && !canCheck) return { action: 'fold' }
  if (rnd < 0.2 && stacks.my >= minRaise)
    return { action: 'raise', amount: minRaise }
  return canCheck ? { action: 'check' } : { action: 'call' }
}

// ---- 5) Compose the replaceable getBotAction ----
const getBotAction = (
  gameState: GameState,
  botPlayer: Player,
  unseenCards?: Card[]
): { action: PlayerAction; amount?: number } => {
  const opponent = gameState.players.find((p) => p.id !== botPlayer.id)!
  const callAmount = Math.max(0, opponent.currentBet - botPlayer.currentBet)
  const canCheck = callAmount === 0
  const pot = gameState.pot + callAmount
  const minRaise = gameState.minRaise

  let equity: number

  if (gameState.phase === 'preflop') {
    const g = preflopGroup(botPlayer.cards[0], botPlayer.cards[1]) // 0~5
    const table = [0.63, 0.58, 0.54, 0.5, 0.46, 0.42]
    equity = table[g]
  } else if (gameState.phase === 'showdown' || gameState.phase === 'gameOver') {
    return { action: 'check' }
  } else {
    const rank = postflopStrengthRank(botPlayer.cards, gameState.communityCards) // 0~9
    let approx = 0.3 + (rank / 9) * 0.5
    const pool = unseenCards ?? []
    const mc = pool.length
      ? estimateEquityVsOne(
          botPlayer.cards,
          gameState.communityCards,
          pool,
          250
        )
      : approx
    equity = approx * 0.4 + mc * 0.6
  }

  return chooseActionByEquity(
    equity,
    gameState.pot,
    callAmount,
    canCheck,
    { my: botPlayer.chips, opp: opponent.chips },
    minRaise
  )
}

export default function Holdem() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'preflop',
    pot: 0,
    communityCards: [],
    currentPlayer: 'player',
    players: [
      {
        id: 'player',
        name: 'You',
        chips: 1000,
        cards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
      },
      {
        id: 'bot',
        name: 'Bot',
        chips: 1000,
        cards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
      },
    ],
    dealer: 'player',
    smallBlind: 10,
    bigBlind: 20,
    minRaise: 20,
    winner: null,
    winningHand: null,
  })

  const [deck, setDeck] = useState<Card[]>([])
  const [gameMessage, setGameMessage] = useState<string>('')

  const player = gameState.players.find((p) => p.id === 'player')!
  const bot = gameState.players.find((p) => p.id === 'bot')!
  const opponent = gameState.players.find(
    (p) => p.id !== gameState.currentPlayer
  )!
  const callAmount = Math.max(0, opponent.currentBet - player.currentBet)

  // Load chips from local storage
  useEffect(() => {
    try {
      const playerChips = localStorage.getItem('playerChips')
      const botChips = localStorage.getItem('botChips')

      if (playerChips && botChips) {
        setGameState((prev) => ({
          ...prev,
          players: [
            { ...prev.players[0], chips: parseInt(playerChips, 10) },
            { ...prev.players[1], chips: parseInt(botChips, 10) },
          ],
        }))
      }
    } catch {}
  }, [])

  // Reset chips for both players
  const resetChips = () => {
    localStorage.setItem('playerChips', '1000')
    localStorage.setItem('botChips', '1000')
    setGameState((prev) => {
      const players = prev.players.map((p) => ({
        ...p,
        chips: 1000,
        currentBet: 0,
      }))
      return {
        ...prev,
        players,
      }
    })
  }

  const initGame = () => {
    const newDeck = shuffleDeck(createDeck())
    const newPlayers: Player[] = [
      {
        id: 'player',
        name: 'You',
        chips:
          gameState.players[0].chips > 0 ? gameState.players[0].chips : 1000,
        cards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
      },
      {
        id: 'bot',
        name: 'Bot',
        chips:
          gameState.players[1].chips > 0 ? gameState.players[1].chips : 1000,
        cards: [],
        currentBet: 0,
        hasActed: false,
        hasFolded: false,
        isAllIn: false,
      },
    ]

    // Deal hole cards
    newPlayers[0].cards = [newDeck[0], newDeck[2]]
    newPlayers[1].cards = [newDeck[1], newDeck[3]]

    // Ensure both players have not acted yet
    newPlayers.forEach((p) => (p.hasActed = false))

    // Set blinds
    const smallBlindPlayer = newPlayers.find((p) => p.id === gameState.dealer)!
    const bigBlindPlayer = newPlayers.find((p) => p.id !== gameState.dealer)!

    smallBlindPlayer.currentBet = gameState.smallBlind
    smallBlindPlayer.chips -= gameState.smallBlind
    bigBlindPlayer.currentBet = gameState.bigBlind
    bigBlindPlayer.chips -= gameState.bigBlind

    setGameState((prev) => ({
      ...prev,
      phase: 'preflop',
      pot: prev.smallBlind + prev.bigBlind,
      communityCards: [],
      currentPlayer: prev.dealer, // Small blind acts first pre-flop
      players: newPlayers,
      winner: null,
      winningHand: null,
    }))

    setDeck(newDeck.slice(4))
    setGameMessage('New hand started! Place your bets.')
  }

  const dealCommunityCards = useCallback(
    (
      currentPhase: GamePhase,
      currentDeck: Card[],
      currentCommunityCards: Card[]
    ) => {
      const newDeck = [...currentDeck]
      let newCommunityCards = [...currentCommunityCards]

      if (currentPhase === 'preflop') {
        // Deal flop (3 cards)
        newCommunityCards = [newDeck[0], newDeck[1], newDeck[2]]
        return { newCommunityCards, remainingDeck: newDeck.slice(3) }
      } else if (currentPhase === 'flop') {
        // Deal turn (1 card)
        newCommunityCards.push(newDeck[0])
        return { newCommunityCards, remainingDeck: newDeck.slice(1) }
      } else if (currentPhase === 'turn') {
        // Deal river (1 card)
        newCommunityCards.push(newDeck[0])
        return { newCommunityCards, remainingDeck: newDeck.slice(1) }
      }

      return { newCommunityCards, remainingDeck: newDeck }
    },
    []
  )

  const playerAction = useCallback(
    (action: PlayerAction, amount?: number) => {
      setGameState((prev) => {
        const players = prev.players.map((p) => ({ ...p }))
        const newState = { ...prev, players, pot: prev.pot }
        const currentPlayerObj = players.find(
          (p) => p.id === newState.currentPlayer
        )!
        const opponent = players.find((p) => p.id !== newState.currentPlayer)!

        let actionMsg = ''
        switch (action) {
          case 'fold':
            currentPlayerObj.hasFolded = true
            newState.winner = opponent.id
            newState.phase = 'gameOver'
            // Award pot to winner immediately on fold
            const winnerObj = players.find((p) => p.id === opponent.id)
            if (winnerObj) {
              winnerObj.chips += newState.pot
              newState.pot = 0
            }
            // Save chips to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                'playerChips',
                String(newState.players[0].chips)
              )
              localStorage.setItem(
                'botChips',
                String(newState.players[1].chips)
              )
            }
            actionMsg = `${currentPlayerObj.name} folded. ${opponent.name} wins!`
            break

          case 'call': {
            const needed = Math.max(
              0,
              opponent.currentBet - currentPlayerObj.currentBet
            )
            const callAmount = Math.min(needed, currentPlayerObj.chips)
            currentPlayerObj.currentBet += callAmount
            currentPlayerObj.chips -= callAmount
            newState.pot += callAmount
            if (currentPlayerObj.chips === 0) currentPlayerObj.isAllIn = true
            actionMsg = `${currentPlayerObj.name} called for $${callAmount}.`
            break
          }

          case 'raise': {
            if (amount && amount > 0) {
              const raiseAmount = Math.min(amount, currentPlayerObj.chips)
              currentPlayerObj.currentBet += raiseAmount
              currentPlayerObj.chips -= raiseAmount
              newState.pot += raiseAmount
              if (currentPlayerObj.chips === 0) currentPlayerObj.isAllIn = true
              actionMsg = `${currentPlayerObj.name} raised to $${raiseAmount}.`
            }
            break
          }

          case 'check':
            actionMsg = `${currentPlayerObj.name} checked.`
            break

          case 'allIn':
            newState.pot += currentPlayerObj.chips
            currentPlayerObj.currentBet += currentPlayerObj.chips
            currentPlayerObj.chips = 0
            currentPlayerObj.isAllIn = true
            actionMsg = `${currentPlayerObj.name} went all in!`
            break
        }

        currentPlayerObj.hasActed = true

        // Update game message for action
        setGameMessage(actionMsg)

        // Check if betting round is complete
        const activePlayers = players.filter((p) => !p.hasFolded)
        const allActed = activePlayers.every((p) => p.hasActed)
        const betsEqual = activePlayers.every(
          (p) => p.currentBet === activePlayers[0].currentBet || p.isAllIn
        )

        if (allActed && betsEqual && !newState.winner) {
          // Reset for next phase
          players.forEach((p) => {
            p.hasActed = false
            p.currentBet = 0
          })

          if (newState.phase === 'preflop') {
            newState.phase = 'flop'
            const { newCommunityCards, remainingDeck } = dealCommunityCards(
              'preflop',
              deck,
              newState.communityCards
            )
            newState.communityCards = newCommunityCards
            setDeck(remainingDeck)
          } else if (newState.phase === 'flop') {
            newState.phase = 'turn'
            const { newCommunityCards, remainingDeck } = dealCommunityCards(
              'flop',
              deck,
              newState.communityCards
            )
            newState.communityCards = newCommunityCards
            setDeck(remainingDeck)
          } else if (newState.phase === 'turn') {
            newState.phase = 'river'
            const { newCommunityCards, remainingDeck } = dealCommunityCards(
              'turn',
              deck,
              newState.communityCards
            )
            newState.communityCards = newCommunityCards
            setDeck(remainingDeck)
          } else if (newState.phase === 'river') {
            newState.phase = 'showdown'

            // Determine winner with proper tie-breaking
            const player1Hand = getBestHand(
              newState.players[0].cards,
              newState.communityCards
            )
            const player2Hand = getBestHand(
              newState.players[1].cards,
              newState.communityCards
            )

            let winnerId: string | 'tie' = 'tie'
            let winningHandDesc = player1Hand.description
            if (player1Hand.rank > player2Hand.rank) {
              winnerId = newState.players[0].id
              winningHandDesc = player1Hand.description
            } else if (player2Hand.rank > player1Hand.rank) {
              winnerId = newState.players[1].id
              winningHandDesc = player2Hand.description
            } else {
              // Same hand rank, compare hand values
              const cmp = compareHandValues(
                player1Hand.values,
                player2Hand.values
              )
              if (cmp > 0) {
                winnerId = newState.players[0].id
                winningHandDesc = player1Hand.description
              } else if (cmp < 0) {
                winnerId = newState.players[1].id
                winningHandDesc = player2Hand.description
              } else {
                winnerId = 'tie'
                winningHandDesc = player1Hand.description
              }
            }
            newState.winner = winnerId
            newState.winningHand = winningHandDesc

            // Award pot
            if (newState.winner !== 'tie') {
              const winner = newState.players.find(
                (p) => p.id === newState.winner
              )!
              winner.chips += newState.pot
            } else {
              newState.players.forEach((p) => (p.chips += newState.pot / 2))
            }

            // Save chips to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                'playerChips',
                String(newState.players[0].chips)
              )
              localStorage.setItem(
                'botChips',
                String(newState.players[1].chips)
              )
            }

            setGameMessage(
              `${
                newState.winner === 'tie'
                  ? 'Tie'
                  : newState.players.find((p) => p.id === newState.winner)
                      ?.name + ' wins'
              } with ${newState.winningHand}!`
            )
          }

          newState.currentPlayer =
            newState.currentPlayer === 'player' ? 'bot' : 'player'
        } else if (!newState.winner) {
          newState.currentPlayer =
            newState.currentPlayer === 'player' ? 'bot' : 'player'
        }
        // Save chips to localStorage after every action
        if (typeof window !== 'undefined') {
          localStorage.setItem('playerChips', String(players[0].chips))
          localStorage.setItem('botChips', String(players[1].chips))
        }
        return newState
      })
    },
    [dealCommunityCards, deck]
  )

  // Bot action effect
  useEffect(() => {
    if (
      gameState.currentPlayer === 'bot' &&
      gameState.phase !== 'gameOver' &&
      gameState.phase !== 'showdown'
    ) {
      const timer = setTimeout(() => {
        const botPlayer = gameState.players.find((p) => p.id === 'bot')!
        const botAction = getBotAction(gameState, botPlayer, deck)

        if (botAction.action === 'raise') {
          playerAction('raise', botAction.amount)
        } else {
          playerAction(botAction.action)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.phase, gameState, playerAction])

  // Initialize game
  useEffect(() => {
    initGame()
  }, [])

  return (
    <div className='min-h-screen bg-green-800 p-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-white text-center mb-6'>
          Texas Hold'em
        </h1>

        {/* Game Info */}
        <div className='bg-green-700 rounded-lg p-4 mb-4 text-white text-center'>
          <p className='text-lg font-semibold'>Pot: ${gameState.pot}</p>
          <p className='text-sm'>Phase: {gameState.phase}</p>
          {gameMessage && (
            <p className='text-yellow-300 mt-2 text-3xl'>{gameMessage}</p>
          )}
        </div>

        {/* Community Cards */}
        <div className='text-center mb-6'>
          <h3 className='text-white text-lg mb-2'>Community Cards</h3>
          <div className='flex justify-center space-x-2'>
            {gameState.communityCards.map((card, index) => (
              <div
                key={index}
                className='bg-white rounded-lg p-3 shadow-lg min-w-[60px] min-h-[90px] flex items-center justify-center'
              >
                <div
                  className={`text-2xl font-bold flex flex-col items-center justify-center w-full h-full ${
                    card.suit === 'hearts' || card.suit === 'diamonds'
                      ? 'text-red-500'
                      : 'text-black'
                  }`}
                >
                  <span>{card.rank}</span>
                  <span className='mt-1'>{getSuitEmoji(card.suit)}</span>
                </div>
              </div>
            ))}
            {[...Array(5 - gameState.communityCards.length)].map((_, index) => (
              <div
                key={`empty-${index}`}
                className='bg-gray-300 rounded-lg p-3 shadow-lg min-w-[60px] min-h-[90px] flex items-center justify-center'
              />
            ))}
          </div>
        </div>

        {/* Bot Player */}
        <div className='bg-red-100 rounded-lg p-4 mb-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='font-bold text-lg'>{bot.name}</h3>
              <p>Chips: ${bot.chips}</p>
              <p>Current Bet: ${bot.currentBet}</p>
            </div>
            <div className='flex space-x-2'>
              {bot.cards.map((card, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 min-w-[60px] min-h-[90px] flex items-center justify-center ${
                    gameState.phase === 'gameOver' ||
                    gameState.phase === 'showdown'
                      ? 'bg-white shadow-lg'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {gameState.phase === 'gameOver' ||
                  gameState.phase === 'showdown' ? (
                    <div
                      className={`text-2xl font-bold flex flex-col items-center justify-center w-full h-full ${
                        card.suit === 'hearts' || card.suit === 'diamonds'
                          ? 'text-red-500'
                          : 'text-black'
                      }`}
                    >
                      <span>{card.rank}</span>
                      <span className='mt-1'>{getSuitEmoji(card.suit)}</span>
                    </div>
                  ) : (
                    '?'
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className='bg-blue-100 rounded-lg p-4 mb-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='font-bold text-lg'>{player.name}</h3>
              <p>Chips: ${player.chips}</p>
              <p>Current Bet: ${player.currentBet}</p>
            </div>
            <div className='flex space-x-2'>
              {player.cards.map((card, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg p-3 shadow-lg min-w-[60px] min-h-[90px] flex items-center justify-center'
                >
                  <div
                    className={`text-2xl font-bold flex flex-col items-center justify-center w-full h-full ${
                      card.suit === 'hearts' || card.suit === 'diamonds'
                        ? 'text-red-500'
                        : 'text-black'
                    }`}
                  >
                    <span>{card.rank}</span>
                    <span className='mt-1'>{getSuitEmoji(card.suit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {gameState.currentPlayer === 'player' &&
          gameState.phase !== 'gameOver' &&
          gameState.phase !== 'showdown' && (
            <div className='flex justify-center space-x-4 mb-4'>
              <button
                onClick={() => playerAction('fold')}
                className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold'
              >
                Fold
              </button>

              {callAmount === 0 ? (
                <button
                  onClick={() => playerAction('check')}
                  className='bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold'
                >
                  Check
                </button>
              ) : (
                <button
                  onClick={() => playerAction('call')}
                  disabled={player.chips < callAmount}
                  className='bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold'
                >
                  Call ${callAmount}
                </button>
              )}

              <button
                onClick={() =>
                  playerAction('raise', callAmount + gameState.minRaise)
                }
                disabled={player.chips < callAmount + gameState.minRaise}
                className='bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold'
              >
                Raise
              </button>

              <button
                onClick={() => playerAction('allIn')}
                disabled={player.chips === 0}
                className='bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold'
              >
                All In
              </button>
            </div>
          )}

        {/* New Hand Button */}
        {(gameState.phase === 'gameOver' || gameState.phase === 'showdown') && (
          <div className='text-center flex justify-center gap-4'>
            <button
              onClick={initGame}
              className='bg-lime-500 hover:bg-lime-6700 text-white px-8 py-3 rounded-lg font-semibold text-lg'
            >
              Deal New Hand
            </button>
            <button
              onClick={resetChips}
              className='bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg'
            >
              Reset Chips
            </button>
          </div>
        )}

        {/* Current Turn Indicator */}
        {gameState.currentPlayer &&
          gameState.phase !== 'gameOver' &&
          gameState.phase !== 'showdown' && (
            <div className='text-center text-white mt-4'>
              <p className='text-lg'>
                {gameState.currentPlayer === 'player'
                  ? 'Your turn'
                  : "Bot's turn"}
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
