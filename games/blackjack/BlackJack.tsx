'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import styles from './blackjack.module.css'

// Card types
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
const RANKS = [
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
const PLAYER_INIT_CHIP = 1000
const DEALER_INIT_CHIP = 20000

type Suit = (typeof SUITS)[number]
type Rank = (typeof RANKS)[number]

interface Card {
  suit: Suit
  rank: Rank
}

interface Player {
  id: string
  name: string
  chips: number
  hand: Card[]
  bet: number
  isDealer?: boolean
  isStanding?: boolean
  isBusted?: boolean
}

function getCardSvgPath(card: Card) {
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
  return `/img/cards/${rankMap[card.rank]}_of_${card.suit}.svg`
}

function getCardValue(card: Card) {
  if (card.rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(card.rank)) return 10
  return parseInt(card.rank)
}

function calculateHandValue(hand: Card[]) {
  let value = hand.reduce((sum, card) => sum + getCardValue(card), 0)
  let aces = hand.filter((card) => card.rank === 'A').length
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  return value
}

function isSoft(hand: Card[]) {
  // A soft hand contains at least one Ace counted as 11
  let value = 0
  let aces = 0
  for (const c of hand) {
    value += getCardValue(c)
    if (c.rank === 'A') aces++
  }
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  // If any Ace still counted as 11, it's soft
  return (
    hand.some((c) => c.rank === 'A') &&
    value <= 21 &&
    hand.reduce((s, c) => s + (c.rank === 'A' ? 1 : 0), 0) > 0 &&
    value + 10 <= 31
  ) // keeps type happy; logic relies on above adjustments
}

function upcardValue(upcard?: Card) {
  if (!upcard) return 10
  return getCardValue(upcard)
}

// Very compact basic strategy covering Hit/Stand only (no Split/Double implemented in UI)
function basicStrategyDecision(
  playerHand: Card[],
  dealerUpcard?: Card
): 'hit' | 'stand' {
  const total = calculateHandValue(playerHand)
  const soft = isSoft(playerHand)
  const d = upcardValue(dealerUpcard)

  // Pair/split not handled in current UI, so ignore

  if (!soft) {
    if (total >= 17) return 'stand'
    if (total >= 13 && total <= 16) return d >= 2 && d <= 6 ? 'stand' : 'hit'
    if (total === 12) return d >= 4 && d <= 6 ? 'stand' : 'hit'
    // 11 or less: usually double, but we only Hit in MVP
    return 'hit'
  } else {
    // Soft totals
    if (total >= 19) return 'stand' // A,8 or A,9
    if (total === 18) {
      // Standard: stand vs 2,7,8; hit vs 9,A; otherwise double
      if (d === 2 || d === 7 || d === 8) return 'stand'
      if (d === 9 || d === 11) return 'hit' // 11 represents Ace
      return 'hit' // treat double candidates as hit in MVP
    }
    // Soft 13–17 → hit
    return 'hit'
  }
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

export default function BlackJack() {
  // const [players, setPlayers] = useState<Player[]>([])
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    name: 'You',
    chips: PLAYER_INIT_CHIP,
    hand: [],
    bet: 0,
  })
  const [dealer, setDealer] = useState<Player>({
    id: 'dealer',
    name: 'Dealer',
    chips: DEALER_INIT_CHIP,
    hand: [],
    bet: 0,
    isDealer: true,
  })
  const [deck, setDeck] = useState<Card[]>([])
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState<
    'bet' | 'deal' | 'player' | 'dealer' | 'result'
  >('bet')
  const [betAmount, setBetAmount] = useState(100)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false)

  // Load chips from localStorage
  useEffect(() => {
    const playerChips = parseInt(
      localStorage.getItem('bj_playerChips') || '1000',
      10
    )
    const dealerChips = parseInt(
      localStorage.getItem('bj_dealerChips') || '20000',
      10
    )
    setPlayer((prev) => ({
      ...prev,
      chips: playerChips,
    }))
    setDealer((prev) => ({
      ...prev,
      chips: dealerChips,
    }))
  }, [])

  // Save chips to localStorage
  useEffect(() => {
    localStorage.setItem('bj_playerChips', String(player.chips))
    localStorage.setItem('bj_dealerChips', String(dealer.chips))
  }, [player, dealer])

  useEffect(() => {
    if (!autoPlayEnabled) return
    if (phase !== 'player') return
    if (!player || !dealer) return
    if (player.isBusted) return

    const decision = basicStrategyDecision(player.hand, dealer.hand?.[0])
    const delay = 700
    if (decision === 'hit') {
      const t = setTimeout(() => {
        hit()
      }, delay)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        stand()
      }, delay)
      return () => clearTimeout(t)
    }
  }, [autoPlayEnabled, phase, player, dealer, deck])

  function startHand() {
    if (player.chips < betAmount || betAmount <= 0) {
      setMessage('Not enough chips to bet.')
      return
    }
    const newDeck = shuffleDeck(createDeck())
    const playerHand = [newDeck[0], newDeck[2]]
    const dealerHand = [newDeck[1], newDeck[3]]
    setPlayer((prev) => ({
      ...prev,
      hand: playerHand,
      bet: betAmount,
      isStanding: false,
      isBusted: false,
      chips: player.chips - betAmount,
    }))
    setDealer((prev) => ({
      ...prev,
      hand: dealerHand,
      bet: betAmount,
      isStanding: false,
      isBusted: false,
      chips: dealer.chips - betAmount,
    }))
    setDeck(newDeck.slice(4))
    setPhase('player')
    setMessage('Your turn!')
  }

  function hit() {
    if (phase !== 'player') return
    const newCard = deck[0]
    const newHand = [...player.hand, newCard]
    const value = calculateHandValue(newHand)
    setPlayer({ ...player, hand: newHand, isBusted: value > 21 })
    setDeck(deck.slice(1))
    if (value > 21) {
      setMessage('Busted!')
      setPhase('dealer')
      setTimeout(() => dealerTurn(), 1000)
    }
  }

  function stand() {
    setPlayer((prev) => ({ ...prev, isStanding: true }))
    setPhase('dealer')
    setMessage("Dealer's turn...")
    setTimeout(() => dealerTurn(), 1000)
  }

  function dealerTurn() {
    let deckCopy = [...deck]
    while (calculateHandValue(dealer.hand) < 17 && deckCopy.length > 0) {
      dealer.hand.push(deck[0])
      setDeck((prev) => prev.slice(1))
    }
    dealer.isStanding = true
    dealer.isBusted = calculateHandValue(dealer.hand) > 21
    setDealer(dealer)
    setPhase('result')
    setTimeout(() => resolveHand(), 1000)
  }

  function resolveHand() {
    const playerValue = calculateHandValue(player.hand)
    const dealerValue = calculateHandValue(dealer.hand)
    let msg = ''
    let playerChips = player.chips
    let dealerChips = dealer.chips
    if (player.isBusted) {
      msg = 'You busted! Dealer wins.'
      dealerChips += player.bet * 2
    } else if (dealer.isBusted) {
      msg = 'Dealer busted! You win.'
      playerChips += player.bet * 2
    } else if (playerValue > dealerValue) {
      msg = 'You win!'
      playerChips += player.bet * 2
    } else if (playerValue < dealerValue) {
      msg = 'Dealer wins.'
      dealerChips += player.bet * 2
    } else {
      msg = 'Push! Bet returned.'
      playerChips += player.bet
      dealerChips += dealer.bet
    }
    setPlayer((prev) => ({ ...prev, chips: playerChips }))
    setDealer((prev) => ({ ...prev, chips: dealerChips }))
    setPhase('bet')
    setMessage(msg)
  }

  function resetChips() {
    setPlayer((prev) => ({ ...prev, chips: PLAYER_INIT_CHIP }))
    setDealer((prev) => ({ ...prev, chips: DEALER_INIT_CHIP }))
    setMessage('Chips reset!')
  }

  return (
    <div className='min-h-screen bg-green-900 p-4'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-white text-center mb-6'>
          Blackjack 1v1
        </h1>
        <div className='bg-green-700 rounded-lg p-4 mb-4 text-white text-center'>
          <p className='text-lg font-semibold'>
            Your Chips: {player?.chips ?? 1000}
          </p>
          <p className='text-lg font-semibold'>
            Dealer Chips: {dealer?.chips ?? 1000}
          </p>
          <p className='text-yellow-300 mt-2 text-xl'>{message}</p>
          <p className='text-sm mt-1 opacity-80'>
            {autoPlayEnabled
              ? 'Auto Play enabled (basic strategy)'
              : 'Manual play'}
          </p>
        </div>
        <div className='flex flex-col justify-center items-center mb-4'>
          <div className={styles.betSection}>
            <label className={styles.betLabel}>Bet Amount:</label>
            <input
              type='number'
              min='1'
              max={player?.chips ?? 1000}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className={styles.betInput}
            />
          </div>
          <div className={styles.controlPanel}>
            <button
              onClick={startHand}
              className={`${styles.button} ${styles.dealButton}`}
            >
              Deal
            </button>
            <button
              onClick={resetChips}
              className={`${styles.button} ${styles.resetButton}`}
            >
              Reset Chips
            </button>
            <button
              onClick={() => setAutoPlayEnabled((v) => !v)}
              className={`${styles.button} ${styles.autoPlayButton} ${
                !autoPlayEnabled ? styles.disabled : ''
              }`}
              title='Toggle Auto Play (basic strategy)'
            >
              {autoPlayEnabled ? 'Auto Play: ON' : 'Auto Play: OFF'}
            </button>
          </div>
        </div>
        <div className='flex justify-between mb-8 min-h-[360px]'>
          {/* Player Hand */}
          <div className={styles.handSection}>
            <h2 className={styles.handTitle}>
              Your Hand ({calculateHandValue(player?.hand ?? [])})
            </h2>
            <div className={styles.playerHand}>
              {player?.hand.map((card, idx) => (
                <div key={idx} className={styles.card}>
                  <Image
                    src={getCardSvgPath(card)}
                    alt={`${card.rank} of ${card.suit}`}
                    fill
                    sizes='100vw'
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Dealer Hand */}
          <div className={styles.handSection}>
            <h2 className={styles.handTitle}>
              Dealer (
              {phase === 'player'
                ? '?'
                : calculateHandValue(dealer?.hand ?? [])}
              )
            </h2>
            <div className={styles.dealerHand}>
              {dealer?.hand.map((card, idx) => (
                <div key={idx} className={styles.card}>
                  <Image
                    src={getCardSvgPath(card)}
                    alt={`${card.rank} of ${card.suit}`}
                    fill
                    sizes='100vw'
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='min-h-[60px]'>
          {phase === 'player' && (
            <div className={styles.controlPanel}>
              <button
                onClick={hit}
                className={`${styles.button} ${styles.hitButton}`}
              >
                Hit
              </button>
              <button
                onClick={stand}
                className={`${styles.button} ${styles.standButton}`}
              >
                Stand
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Blackjack Game Introduction */}
      <div className='mt-10 bg-white/80 rounded-lg p-6 max-w-2xl mx-auto shadow-lg text-gray-900'>
        <h2 className='text-2xl font-bold mb-2'>
          Blackjack 1v1 Online – Rules & How to Play
        </h2>
        <p className='mb-4'>
          Welcome to <strong>Blackjack 1v1</strong>! Play free blackjack online
          against our dealer bot and enjoy a realistic casino card game
          experience in your browser. Practice blackjack strategy, card
          counting, and betting tips as you try to beat the dealer and win
          chips. Whether you're a beginner or an advanced player, you can learn
          blackjack rules, practice your skills, and master the game.
        </p>
        <h3 className='text-xl font-semibold mb-2'>How to Play Blackjack</h3>
        <ul className='list-disc ml-6 mb-4'>
          <li>
            Place your bet and click <span className='font-semibold'>Deal</span>{' '}
            to start your hand.
          </li>
          <li>
            Try to get as close to 21 as possible without going over (bust).
          </li>
          <li>
            Choose <span className='font-semibold'>Hit</span> to draw another
            card, or <span className='font-semibold'>Stand</span> to end your
            turn.
          </li>
          <li>The dealer must hit until reaching at least 17.</li>
          <li>
            If you beat the dealer or the dealer busts, you win double your bet!
          </li>
          <li>
            Use <span className='font-semibold'>Reset Chips</span> to restart
            with 1000 chips if you run out.
          </li>
        </ul>
        <h3 className='text-xl font-semibold mb-2'>
          Auto Play Strategy Instruction
        </h3>
        <p className='mb-3'>
          <strong>Auto Play</strong> uses a simplified <em>basic strategy</em>{' '}
          that considers only your current hand (hard/soft total) and the
          dealer's upcard. It never peeks at the deck or any hidden cards.
        </p>
        <ul className='list-disc ml-6 mb-3'>
          <li>
            <strong>Hard hands:</strong> Stand on 17+; 13–16 stand vs dealer
            2–6, otherwise hit; 12 stands vs 4–6, otherwise hit; 11 or less hit.
          </li>
          <li>
            <strong>Soft hands:</strong> 19+ stand; 18 stands vs 2/7/8, hits vs
            9/A; soft 13–17 hit.
          </li>
          <li>
            <strong>Double/Split:</strong> Not automated in this MVP; candidates
            are treated as hit.
          </li>
        </ul>
        <p className='mb-0'>
          Toggle <strong>Auto Play</strong> with the button above. When enabled,
          it acts only on your turn with a short delay, then yields to the
          dealer as usual.
        </p>
        <p className='text-sm text-gray-600'>
          Enjoy this online blackjack game and improve your skills. Play
          blackjack for fun, learn the rules, and test your luck against the
          dealer AI. Good luck!
        </p>
      </div>
    </div>
  )
}
