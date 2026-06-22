'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import Image from 'next/image'
import { motion } from 'motion/react'
import styles from './holdem.module.css'
import {
  type Card,
  type Rank,
  type Suit,
  compareHandValues,
  getBestHand,
  getCurrentBestHand,
  isWinningCard,
} from './holdemHand'

type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'gameOver'
type PlayerAction = 'fold' | 'call' | 'raise' | 'check' | 'allIn'

type LogAuthor = 'you' | 'mav' | null
interface LogEntry {
  author: LogAuthor
  text: string
}

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
  winningCards: Card[] | null
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
  return getBestHand(my, board).rank
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

// Helper to get SVG path for a card
const getCardSvgPath = (card: Card): string => {
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
        name: 'Mav',
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
    winningCards: null,
  })

  const [deck, setDeck] = useState<Card[]>([])
  const [gameMessage, setGameMessage] = useState<string>('')
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [handLog, setHandLog] = useState<LogEntry[]>([])
  const [handNumber, setHandNumber] = useState(0)
  const [isRaiseOpen, setIsRaiseOpen] = useState(false)
  const [raiseAmount, setRaiseAmount] = useState(0)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const logListRef = useRef<HTMLDivElement>(null)

  const pushLog = useCallback((entry: LogEntry) => {
    setHandLog((prev) => [...prev, entry].slice(-30))
  }, [])

  const player = gameState.players.find((p) => p.id === 'player')!
  const bot = gameState.players.find((p) => p.id === 'bot')!
  const playerCallAmount = Math.max(0, bot.currentBet - player.currentBet)

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
    // First, trigger the card fly-out animation
    setIsAnimatingOut(true)

    setTimeout(() => {
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
          name: 'Mav',
          chips:
            gameState.players[1].chips > 0 ? gameState.players[1].chips : 1000,
          cards: [],
          currentBet: 0,
          hasActed: false,
          hasFolded: false,
          isAllIn: false,
        },
      ]

      // Reset the game phase to hide bot cards and clear cards
      setGameState((prev) => ({
        ...prev,
        phase: 'preflop',
        pot: 0,
        communityCards: [],
        currentPlayer: prev.dealer,
        players: newPlayers,
        winner: null,
        winningHand: null,
        winningCards: null,
      }))

      // Reset animation state
      setIsAnimatingOut(false)

      // Small delay to ensure cards are face-down before dealing new ones
      setTimeout(() => {
        // Deal hole cards
        newPlayers[0].cards = [newDeck[0], newDeck[2]]
        newPlayers[1].cards = [newDeck[1], newDeck[3]]

        // Ensure both players have not acted yet
        newPlayers.forEach((p) => (p.hasActed = false))

        // Set blinds
        const smallBlindPlayer = newPlayers.find(
          (p) => p.id === gameState.dealer
        )!
        const bigBlindPlayer = newPlayers.find(
          (p) => p.id !== gameState.dealer
        )!

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
          winningCards: null,
        }))

        setDeck(newDeck.slice(4))
        setGameMessage('New hand started! Place your bets.')

        const nextHand = handNumber + 1
        setHandNumber(nextHand)
        const dealerId = gameState.dealer
        const authorOf = (id: string): LogAuthor =>
          id === 'player' ? 'you' : 'mav'
        setHandLog([
          {
            author: null,
            text: `Hand #${nextHand} — ${
              dealerId === 'player' ? 'You' : 'Mav'
            } on the button`,
          },
          {
            author: authorOf(smallBlindPlayer.id),
            text: `posts small blind $${gameState.smallBlind}`,
          },
          {
            author: authorOf(bigBlindPlayer.id),
            text: `posts big blind $${gameState.bigBlind}`,
          },
        ])
        setIsRaiseOpen(false)
      }, 100) // Small delay to ensure proper card flip animation
    }, 600) // Wait for fly-out animation to complete
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
        const author: LogAuthor =
          currentPlayerObj.id === 'player' ? 'you' : 'mav'

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
            pushLog({ author, text: 'folds' })
            pushLog({
              author: null,
              text: opponent.id === 'player' ? 'You win' : 'Mav wins',
            })
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
            pushLog({ author, text: `calls $${callAmount}` })
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
              pushLog({
                author,
                text: `raises to $${currentPlayerObj.currentBet}`,
              })
            }
            break
          }

          case 'check':
            actionMsg = `${currentPlayerObj.name} checked.`
            pushLog({ author, text: 'checks' })
            break

          case 'allIn':
            newState.pot += currentPlayerObj.chips
            currentPlayerObj.currentBet += currentPlayerObj.chips
            currentPlayerObj.chips = 0
            currentPlayerObj.isAllIn = true
            actionMsg = `${currentPlayerObj.name} went all in!`
            pushLog({
              author,
              text: `all-in $${currentPlayerObj.currentBet}`,
            })
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
            pushLog({ author: null, text: 'Flop' })
          } else if (newState.phase === 'flop') {
            newState.phase = 'turn'
            const { newCommunityCards, remainingDeck } = dealCommunityCards(
              'flop',
              deck,
              newState.communityCards
            )
            newState.communityCards = newCommunityCards
            setDeck(remainingDeck)
            pushLog({ author: null, text: 'Turn' })
          } else if (newState.phase === 'turn') {
            newState.phase = 'river'
            const { newCommunityCards, remainingDeck } = dealCommunityCards(
              'turn',
              deck,
              newState.communityCards
            )
            newState.communityCards = newCommunityCards
            setDeck(remainingDeck)
            pushLog({ author: null, text: 'River' })
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
            if (winnerId !== 'tie') {
              const winnerHole = newState.players.find((p) => p.id === winnerId)!
              newState.winningCards = getBestHand(
                winnerHole.cards,
                newState.communityCards
              ).cards
            } else {
              newState.winningCards = null
            }

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

            pushLog({
              author: null,
              text:
                winnerId === 'tie'
                  ? `Tie — ${winningHandDesc}`
                  : `${
                      winnerId === 'player' ? 'You win' : 'Mav wins'
                    } — ${winningHandDesc}`,
            })
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
    [dealCommunityCards, deck, pushLog]
  )

  // Close the raise sheet whenever it stops being the human's turn
  useEffect(() => {
    if (
      gameState.currentPlayer !== 'player' ||
      gameState.phase === 'showdown' ||
      gameState.phase === 'gameOver'
    ) {
      setIsRaiseOpen(false)
    }
  }, [gameState.currentPlayer, gameState.phase])

  // Keep the hand log scrolled to the newest entry
  useEffect(() => {
    if (logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight
    }
  }, [handLog])

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

  const isPlaying =
    gameState.phase !== 'gameOver' && gameState.phase !== 'showdown'
  const isMyTurn = gameState.currentPlayer === 'player'
  const cardsRevealed =
    gameState.phase === 'showdown' || gameState.phase === 'gameOver'
  const winningCards = gameState.winningCards
  const winningCardClass =
    winningCards && gameState.winner === 'player'
      ? styles.winningCardYou
      : winningCards && gameState.winner === 'bot'
        ? styles.winningCardBot
        : ''

  const yourHand =
    player.cards.length === 2 && !isAnimatingOut
      ? getCurrentBestHand(player.cards, gameState.communityCards)
      : null

  const bigBlind = gameState.bigBlind
  const minRaiseTo = player.currentBet + playerCallAmount + gameState.minRaise
  const maxRaiseTo = player.currentBet + player.chips
  const canFullRaise =
    isMyTurn && player.chips > 0 && maxRaiseTo >= minRaiseTo
  const canAllInOnly =
    isMyTurn && player.chips > 0 && maxRaiseTo < minRaiseTo

  const snapRaise = (value: number) => {
    const stepped = Math.round(value / bigBlind) * bigBlind
    return Math.min(maxRaiseTo, Math.max(minRaiseTo, stepped))
  }
  const potAfterCall = gameState.pot + playerCallAmount
  const presetValues: Record<string, number> = {
    min: minRaiseTo,
    half: snapRaise(player.currentBet + playerCallAmount + potAfterCall * 0.5),
    pot: snapRaise(player.currentBet + playerCallAmount + potAfterCall),
    max: maxRaiseTo,
  }

  const phaseLabel = (() => {
    switch (gameState.phase) {
      case 'preflop':
        return 'PRE-FLOP'
      case 'flop':
        return 'FLOP'
      case 'turn':
        return 'TURN'
      case 'river':
        return 'RIVER'
      case 'showdown':
        return 'SHOWDOWN'
      default:
        return 'HAND OVER'
    }
  })()

  const openRaise = () => {
    setRaiseAmount(minRaiseTo)
    setActivePreset('min')
    setIsRaiseOpen(true)
  }
  const toggleRaise = () => (isRaiseOpen ? setIsRaiseOpen(false) : openRaise())
  const selectPreset = (key: string) => {
    setRaiseAmount(presetValues[key])
    setActivePreset(key)
  }
  const onSlider = (value: number) => {
    setRaiseAmount(value)
    setActivePreset(null)
  }
  const confirmRaise = () => {
    const target = raiseAmount
    setIsRaiseOpen(false)
    if (target >= maxRaiseTo) {
      playerAction('allIn')
    } else {
      playerAction('raise', target - player.currentBet)
    }
  }
  const doFold = () => {
    setIsRaiseOpen(false)
    playerAction('fold')
  }
  const doCheck = () => {
    setIsRaiseOpen(false)
    playerAction('check')
  }
  const doCall = () => {
    setIsRaiseOpen(false)
    playerAction('call')
  }
  const doAllIn = () => {
    setIsRaiseOpen(false)
    playerAction('allIn')
  }

  const renderHoleCard = (card: Card, index: number, faceDown: boolean) => {
    const cardIsWinner =
      cardsRevealed &&
      winningCards &&
      isWinningCard(card, winningCards)

    if (faceDown) {
      return (
        <div
          key={index}
          style={{ '--i': index } as CSSProperties}
          className={`${styles.holeCard} ${
            cardsRevealed ? styles.flipped : ''
          } ${isAnimatingOut ? styles.flyOut : ''} ${
            cardIsWinner ? winningCardClass : ''
          }`}
        >
          <div className={styles.cardInner}>
            <div className={styles.cardFront}>
              <Image
                src='/assets/img/cards/card_back.jpg'
                alt='Card Back'
                fill
                sizes='120px'
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className={styles.cardBack}>
              <Image
                src={getCardSvgPath(card)}
                alt={`${card.rank} of ${card.suit}`}
                fill
                sizes='120px'
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div
        key={index}
        style={{ '--i': index } as CSSProperties}
        className={`${styles.holeCard} ${isAnimatingOut ? styles.flyOut : ''} ${
          cardIsWinner ? winningCardClass : ''
        }`}
      >
        <Image
          src={getCardSvgPath(card)}
          alt={`${card.rank} of ${card.suit}`}
          fill
          sizes='120px'
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    )
  }

  return (
    <div className='sm:p-4'>
      <motion.div
        className={`${styles.board}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className='text-2xl sm:text-3xl font-bold text-white text-center p-4 sm:p-8'>
          Texas Hold&apos;em
        </h1>
        <div className={styles.stage}>
          {/* Hand log (desktop only) */}
          <div className={`${styles.panel} ${styles.handLog}`}>
            <div className={styles.handLogHeader}>
              <span>HAND LOG</span>
              <span>#{handNumber}</span>
            </div>
            <div className={styles.handLogList} ref={logListRef}>
              {handLog.map((entry, i) => (
                <div key={i} className={styles.logEntry}>
                  {entry.author && (
                    <span
                      className={
                        entry.author === 'you' ? styles.tagYou : styles.tagMav
                      }
                    >
                      {entry.author === 'you' ? 'You' : 'Mav'}
                    </span>
                  )}
                  <span className={styles.logText}>{entry.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your hand indicator */}
          {yourHand && (
            <div className={`${styles.panel} ${styles.yourHand}`}>
              <div className={styles.yourHandLabel}>YOUR HAND</div>
              <div className={styles.yourHandName}>{yourHand.description}</div>
              <div className={styles.strengthTrack}>
                <div
                  className={styles.strengthFill}
                  style={{ width: `${((yourHand.rank + 1) / 9) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Stadium table */}
          <div className={styles.table}>
            {/* Bot seat (top) */}
            <div
              className={`${styles.seat} ${
                gameState.currentPlayer === 'bot' ? styles.seatActive : ''
              }`}
            >
              <div className={styles.plate}>
                <span className={styles.avatar}>🤖</span>
                <div className={styles.plateInfo}>
                  <span className={styles.plateName}>
                    {bot.name}
                    {gameState.dealer === 'bot' && (
                      <span className={styles.dealerBtn}>D</span>
                    )}
                  </span>
                  <span className={styles.plateChips}>${bot.chips}</span>
                </div>
              </div>
              <div className={styles.seatCards}>
                {bot.cards.map((card, index) =>
                  renderHoleCard(card, index, true)
                )}
              </div>
            </div>

            {/* Bot bet stack */}
            {bot.currentBet > 0 && (
              <div className={`${styles.betStack} ${styles.betStackTop}`}>
                <span className={styles.chip} />${bot.currentBet}
              </div>
            )}

            {/* Center cluster */}
            <div className={styles.center}>
              <div className={styles.phasePill}>{phaseLabel}</div>
              <div className={styles.community}>
                {gameState.communityCards.map((card, index) => (
                  <div
                    key={index}
                    style={{ '--i': index } as CSSProperties}
                    className={`${styles.commCard} ${
                      winningCards && isWinningCard(card, winningCards)
                        ? winningCardClass
                        : ''
                    }`}
                  >
                    <Image
                      src={getCardSvgPath(card)}
                      alt={`${card.rank} of ${card.suit}`}
                      fill
                      sizes='80px'
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </div>
                ))}
                {[...Array(5 - gameState.communityCards.length)].map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className={`${styles.commCard} ${styles.commEmpty}`}
                    />
                  )
                )}
              </div>
              <div className={styles.pot}>
                <span className={styles.potLabel}>POT</span>
                <span className={styles.potValue}>${gameState.pot}</span>
              </div>
            </div>

            {/* Player bet stack */}
            {player.currentBet > 0 && (
              <div className={`${styles.betStack} ${styles.betStackBottom}`}>
                <span className={styles.chip} />${player.currentBet}
              </div>
            )}

            {/* Player seat (bottom) */}
            <div
              className={`${styles.seat} ${
                gameState.currentPlayer === 'player' ? styles.seatActive : ''
              }`}
            >
              <div className={styles.seatCards}>
                {player.cards.map((card, index) =>
                  renderHoleCard(card, index, false)
                )}
              </div>
              <div className={styles.plate}>
                <span className={styles.avatar}>🧑</span>
                <div className={styles.plateInfo}>
                  <span className={styles.plateName}>
                    {player.name}
                    {gameState.dealer === 'player' && (
                      <span className={styles.dealerBtn}>D</span>
                    )}
                  </span>
                  <span className={styles.plateChips}>${player.chips}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dimming backdrop while the raise sheet is open */}
          {isRaiseOpen && (
            <div
              className={styles.sheetBackdrop}
              onClick={() => setIsRaiseOpen(false)}
            />
          )}

          {/* Action dock */}
          <div className={styles.dock}>
            {isPlaying ? (
              <>
                <div className={styles.actionRow}>
                  <button
                    onClick={doFold}
                    disabled={!isMyTurn}
                    className={`${styles.actBtn} ${styles.foldBtn}`}
                  >
                    Fold
                  </button>

                  {playerCallAmount === 0 ? (
                    <button
                      onClick={doCheck}
                      disabled={!isMyTurn}
                      className={`${styles.actBtn} ${styles.callBtn}`}
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      onClick={doCall}
                      disabled={!isMyTurn || player.chips < playerCallAmount}
                      className={`${styles.actBtn} ${styles.callBtn}`}
                    >
                      Call
                      <span className={styles.hint}>
                        ${Math.min(playerCallAmount, player.chips)}
                      </span>
                    </button>
                  )}

                  {canAllInOnly ? (
                    <button
                      onClick={doAllIn}
                      disabled={!isMyTurn}
                      className={`${styles.actBtn} ${styles.raiseBtn}`}
                    >
                      All In
                      <span className={styles.hint}>${player.chips}</span>
                    </button>
                  ) : (
                    <button
                      onClick={toggleRaise}
                      disabled={!canFullRaise}
                      className={`${styles.actBtn} ${styles.raiseBtn} ${
                        isRaiseOpen ? styles.raiseBtnActive : ''
                      }`}
                    >
                      Raise
                      <span
                        className={`${styles.caret} ${
                          isRaiseOpen ? styles.caretOpen : ''
                        }`}
                      >
                        ▾
                      </span>
                    </button>
                  )}
                </div>

                <div
                  className={`${styles.raiseSheet} ${
                    isRaiseOpen ? styles.raiseSheetOpen : ''
                  }`}
                >
                  <div className={styles.sheetInner}>
                    <button
                      className={styles.handle}
                      onClick={() => setIsRaiseOpen(false)}
                      aria-label='Close raise panel'
                    />
                    <div className={styles.raiseToRow}>
                      <span className={styles.raiseToLabel}>RAISE TO</span>
                      <span className={styles.raiseToValue}>${raiseAmount}</span>
                    </div>
                    <input
                      type='range'
                      className={styles.slider}
                      min={minRaiseTo}
                      max={maxRaiseTo}
                      step={bigBlind}
                      value={raiseAmount}
                      onChange={(e) => onSlider(Number(e.target.value))}
                    />
                    <div className={styles.presets}>
                      {(
                        [
                          ['min', 'MIN'],
                          ['half', '½ POT'],
                          ['pot', 'POT'],
                          ['max', 'MAX'],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => selectPreset(key)}
                          className={`${styles.preset} ${
                            activePreset === key ? styles.presetActive : ''
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button className={styles.confirm} onClick={confirmRaise}>
                      {raiseAmount >= maxRaiseTo
                        ? `All In $${raiseAmount}`
                        : `Raise to $${raiseAmount}`}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.endRow}>
                <button
                  onClick={initGame}
                  className={`${styles.actBtn} ${styles.dealBtn}`}
                >
                  Deal New Hand
                </button>
                <button
                  onClick={resetChips}
                  className={`${styles.actBtn} ${styles.resetBtn}`}
                >
                  Reset Chips
                </button>
              </div>
            )}
          </div>

          {gameMessage && <p className={styles.message}>{gameMessage}</p>}
        </div>
      </motion.div>
      {/* Texas Hold'em Introduction & How to Play */}
      <motion.div
        className={`${styles.howToPlay}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-2xl font-bold mb-2'>
          Texas Hold'em Poker: Rules & How to Play
        </h2>
        <p className='mb-4'>
          Welcome to <strong>Texas Hold'em Poker</strong> – the world's most
          popular poker game! Play online against our bot and learn the rules,
          strategies, and tips for winning at Texas Hold'em. This game is
          perfect for beginners and advanced players alike.
        </p>
        <h3 className='text-xl font-semibold mb-2'>
          How to Play Texas Hold'em
        </h3>
        <ul className='list-disc ml-6 mb-4'>
          <li>Each player is dealt two private cards (hole cards).</li>
          <li>Five community cards are dealt face up in the center.</li>
          <li>
            Players use any combination of five cards to make the best poker
            hand.
          </li>
          <li>Betting rounds: Preflop, Flop, Turn, River, and Showdown.</li>
          <li>Actions: Fold, Check, Call, Raise, or go All-In.</li>
          <li>
            The winner is the player with the best hand at showdown, or the last
            player remaining after all others fold.
          </li>
        </ul>
        <h3 className='text-xl font-semibold mb-2'>
          Chip Reset & Game Continuation
        </h3>
        <p className='mb-4'>
          Both players will start again with 1000 chips. If you run out of
          chips, you can reset the chips by clicking the{' '}
          <span className='font-semibold text-red-600'>Reset Chips</span>{' '}
          button. The bot will be automatically refilled to 1000 chips if it
          runs out. You can continue playing without losing your progress.
        </p>
        <h3 className='text-xl font-semibold mb-2'>About the Bot's Strategy</h3>
        <p className='mb-4'>
          The bot you play against uses a simplified poker strategy based on
          hand strength and probability. Before the flop, it groups hands by
          strength and acts accordingly. After the flop, it estimates its
          chances of winning using a <strong>Monte Carlo simulation</strong>: it
          runs hundreds of random trials to simulate possible outcomes,
          calculating its equity (chance to win) against your possible hand. The
          bot then compares its equity to the pot odds and chooses actions like
          fold, call, raise, or all-in, aiming to make mathematically sound
          decisions.
        </p>
        <p className='mb-4'>
          This approach makes the bot challenging and educational, giving you a
          realistic poker experience while demonstrating how probability and
          simulation can guide decision-making in games of chance.
        </p>
        <p className='text-sm text-gray-600'>
          Enjoy this interactive Texas Hold'em Poker game and improve your
          skills. Good luck at the tables!
        </p>
      </motion.div>
    </div>
  )
}
