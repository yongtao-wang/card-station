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
const DEALER_INIT_CHIP = Number.MAX_SAFE_INTEGER // effectively infinite dealer chips

const CARD_OFFSET_MOBILE = '-45px'
const CARD_OFFSET_DESKTOP = '-70px'

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
  return `/assets/img/cards/${rankMap[card.rank]}_of_${card.suit}.svg`
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
  // Responsive card offset
  const [cardOffset, setCardOffset] = useState(CARD_OFFSET_MOBILE)

  useEffect(() => {
    const updateCardOffset = () => {
      setCardOffset(
        window.innerWidth >= 640 ? CARD_OFFSET_DESKTOP : CARD_OFFSET_MOBILE
      )
    }

    updateCardOffset()
    window.addEventListener('resize', updateCardOffset)
    return () => window.removeEventListener('resize', updateCardOffset)
  }, [])

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
  const [betAmount, setBetAmount] = useState(0)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [showResetDropdown, setShowResetDropdown] = useState(false)
  const [isClosingDropdown, setIsClosingDropdown] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const playerChips = parseInt(
      localStorage.getItem('bj_playerChips') || '1000',
      10
    )
    const savedWins = parseInt(localStorage.getItem('bj_wins') || '0', 10)
    const savedLosses = parseInt(localStorage.getItem('bj_losses') || '0', 10)
    setPlayer((prev) => ({
      ...prev,
      chips: playerChips,
    }))
    setWins(savedWins)
    setLosses(savedLosses)
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('bj_playerChips', String(player.chips))
    localStorage.setItem('bj_wins', String(wins))
    localStorage.setItem('bj_losses', String(losses))
  }, [player.chips, wins, losses])

  // Show reset dropdown when balance is <= 0 and in bet phase
  useEffect(() => {
    setShowResetDropdown(player.chips <= 0 && phase === 'bet')
  }, [player.chips, phase])

  useEffect(() => {
    if (!autoPlayEnabled) return
    if (phase !== 'player') return
    if (!player || !dealer) return
    if (calculateHandValue(player.hand) > 21) return

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
      chips: player.chips - betAmount,
    }))
    setDealer((prev) => ({
      ...prev,
      hand: dealerHand,
      bet: betAmount,
      isStanding: false,
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
    setPlayer({ ...player, hand: newHand })
    setDeck(deck.slice(1))
    if (value > 21) {
      setMessage('Busted!')
      setPhase('result')
      setTimeout(() => resolveBustHand(), 1000)
    }
  }

  function stand() {
    setPlayer((prev) => ({ ...prev, isStanding: true }))
    setPhase('dealer')
    setMessage("Dealer's turn...")
    setTimeout(() => dealerTurn(), 1000)
  }

  function dealerTurn() {
    let currentDeck = [...deck]
    let currentDealerHand = [...dealer.hand]

    while (
      calculateHandValue(currentDealerHand) < 17 &&
      currentDeck.length > 0
    ) {
      const newCard = currentDeck[0]
      currentDealerHand.push(newCard)
      currentDeck = currentDeck.slice(1)
    }

    setDealer((prev) => ({
      ...prev,
      hand: currentDealerHand,
      isStanding: true,
    }))
    setDeck(currentDeck)
    setPhase('result')
    setTimeout(() => resolveHand(currentDealerHand), 1000)
  }

  function resolveBustHand() {
    // Player busted - immediate loss, no dealer turn needed
    setLosses((prev) => prev + 1)
    setBetAmount(0)
    setPhase('bet')
    setMessage('You busted! Dealer wins.')
  }

  function resolveHand(dealerHand?: Card[]) {
    const playerValue = calculateHandValue(player.hand)
    // Use the passed dealerHand if provided, otherwise use the current dealer state
    const finalDealerHand = dealerHand || dealer.hand
    const dealerValue = calculateHandValue(finalDealerHand)

    // Debug logging to verify dealer hand calculation
    console.log('Dealer final hand:', finalDealerHand)
    console.log('Dealer value:', dealerValue)

    let msg = ''
    let playerChips = player.chips

    // Player should not bust here since busts are handled immediately
    if (dealerValue > 21) {
      msg = 'Dealer busted! You win.'
      playerChips += player.bet * 2
      setWins((prev) => prev + 1)
    } else if (playerValue > dealerValue) {
      msg = 'You win!'
      playerChips += player.bet * 2
      setWins((prev) => prev + 1)
    } else if (playerValue < dealerValue) {
      msg = 'Dealer wins.'
      setLosses((prev) => prev + 1)
    } else {
      msg = 'Push! Bet returned.'
      playerChips += player.bet
    }
    setPlayer((prev) => ({ ...prev, chips: playerChips }))
    setBetAmount(0)
    setPhase('bet')
    setMessage(msg)
  }

  function resetChips() {
    setIsClosingDropdown(true)
    setTimeout(() => {
      setPlayer((prev) => ({ ...prev, chips: PLAYER_INIT_CHIP }))
      setWins(0)
      setLosses(0)
      setMessage('Chips and stats reset!')
      setShowResetDropdown(false)
      setIsClosingDropdown(false)
    }, 300) // Match the animation duration
  }

  function addToBet(amount: number) {
    if (phase !== 'bet') return
    const newBet = betAmount + amount
    if (newBet > (player?.chips ?? 0)) {
      setMessage('Not enough chips!')
      return
    }
    setBetAmount(newBet)
    setMessage('')
  }

  return (
    <div className='min-h-screen p-2 sm:p-4'>
      <div className='w-full max-w-4xl bg-green-900 mx-auto rounded-3xl shadow-lg p-2 sm:p-4 relative'>
        {/* Player Stats - Responsive positioning */}
        <div className='absolute top-2 right-2 sm:top-4 sm:right-4 text-white shadow-lg min-w-[160px] sm:min-w-[200px] z-40'>
          <div className='relative p-2 sm:p-4 border-b border-slate-700 rounded-lg bg-slate-800 z-50'>
            <h3 className='text-yellow-400 text-sm sm:text-lg font-bold text-center mb-2 sm:mb-3'>
              Player Stats
            </h3>
            <div className='grid grid-cols-2 gap-2 sm:gap-4 text-center'>
              <div>
                <div className='text-green-400 text-sm sm:text-xl font-bold'>
                  ${player?.chips ?? 1000}
                </div>
                <div className='text-gray-300 text-xs sm:text-sm'>Balance</div>
              </div>
              <div>
                <div className='text-yellow-400 text-sm sm:text-xl font-bold'>
                  {wins + losses > 0
                    ? ((wins / (wins + losses)) * 100).toFixed(1)
                    : '0.0'}
                  %
                </div>
                <div className='text-gray-300 text-xs sm:text-sm'>Win Rate</div>
              </div>
              <div>
                <div className='text-green-400 text-sm sm:text-xl font-bold'>
                  {wins}
                </div>
                <div className='text-gray-300 text-xs sm:text-sm'>Wins</div>
              </div>
              <div>
                <div className='text-red-400 text-sm sm:text-xl font-bold'>
                  {losses}
                </div>
                <div className='text-gray-300 text-xs sm:text-sm'>Losses</div>
              </div>
            </div>
          </div>

          {/* Reset Chips Dropdown */}
          {showResetDropdown && (
            <div
              className={`${styles.resetDropdown} ${
                isClosingDropdown ? styles.closing : ''
              } -translate-y-3`}
            >
              <p>Reset balance to $1000 to continue playing.</p>
              <div className={styles.buttonGroup}>
                <button
                  onClick={resetChips}
                  className={styles.confirmButton}
                  disabled={isClosingDropdown}
                >
                  Reset Chips
                </button>
              </div>
            </div>
          )}
        </div>

        <h1 className='text-2xl sm:text-3xl font-bold text-white text-center p-4 sm:p-8'>
          Blackjack 1v1
        </h1>
        <div className='flex flex-col items-center m-2 sm:m-4 min-h-[300px] sm:min-h-[360px]'>
          {/* Dealer Hand */}
          <div className={`${styles.handSection} mb-4 sm:mb-8`}>
            <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
              Dealer (
              {phase === 'player'
                ? '?'
                : calculateHandValue(dealer?.hand ?? [])}
              )
            </h2>
            <div className={`${styles.dealerHand} ${styles.overlapping}`}>
              {dealer?.hand.map((card, idx) => (
                <div
                  key={idx}
                  className={`${styles.card} ${styles.cardOverlapping}`}
                  style={{
                    marginLeft: idx > 0 ? cardOffset : '0',
                    zIndex: idx + 1,
                  }}
                >
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

          {/* Deck Display */}
          <div className={styles.deckContainer}>
            <div className={styles.deckStack}>
              {/* Create 52 stacked cards */}
              {Array.from({ length: 52 }, (_, idx) => (
                <div
                  key={idx}
                  className={styles.deckCard}
                  style={{
                    top: `${idx * 0.2}px`,
                    zIndex: 52 - idx,
                  }}
                >
                  <Image
                    src='/assets/img/cards/card_back.jpg'
                    alt='Card back'
                    fill
                    sizes='100px'
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Player Hand */}
          <div className={`${styles.handSection} mt-4 sm:mt-8`}>
            <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
              Your Hand ({calculateHandValue(player?.hand ?? [])})
            </h2>
            <div className={`${styles.playerHand} ${styles.overlapping}`}>
              {player?.hand.map((card, idx) => (
                <div
                  key={idx}
                  className={`${styles.card} ${styles.cardOverlapping}`}
                  style={{
                    marginLeft: idx > 0 ? cardOffset : '0',
                    zIndex: idx + 1,
                  }}
                >
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

        <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
          {/* Betting Section */}
          <div
            className={`${styles.betSection} p-2 sm:p-6 justify-self-center lg:justify-self-end order-2 lg:order-1`}
          >
            <div className='bg-green-900 border-4 border-yellow-500 rounded-full w-24 h-24 sm:w-32 sm:h-32 flex flex-col justify-center items-center shadow-lg'>
              <label
                className={`${styles.betLabel} mb-1 text-center text-xs sm:text-sm`}
              >
                Current Bet
              </label>
              <span className='text-center text-white text-sm sm:text-lg mt-1 sm:mt-2'>
                $ {betAmount}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className='flex flex-col order-1 lg:order-2'>
            {/* Betting Buttons */}
            <div className='text-center lg:text-left px-2 sm:px-4 text-sm sm:text-base'>
              Place Your Bet:
            </div>
            <div className={`${styles.betButtons} p-2 sm:p-4`}>
              <button
                onClick={() => addToBet(1)}
                disabled={phase !== 'bet'}
                className={styles.betButton}
              >
                +$1
              </button>
              <button
                onClick={() => addToBet(10)}
                disabled={phase !== 'bet'}
                className={styles.betButton}
              >
                +$10
              </button>
              <button
                onClick={() => addToBet(50)}
                disabled={phase !== 'bet'}
                className={styles.betButton}
              >
                +$50
              </button>
              <button
                onClick={() => addToBet(100)}
                disabled={phase !== 'bet'}
                className={styles.betButton}
              >
                +$100
              </button>
            </div>
            {phase === 'bet' ? (
              <div className='flex flex-col justify-center items-center mb-2 sm:mb-4'>
                <div
                  className={`${styles.controlPanel} flex-col sm:flex-row gap-2 sm:gap-4`}
                >
                  <button
                    onClick={startHand}
                    className={`${styles.button} ${styles.dealButton} w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm`}
                  >
                    Deal
                  </button>
                  <button
                    onClick={() => setAutoPlayEnabled((v) => !v)}
                    className={`${styles.button} ${styles.autoPlayButton} ${
                      !autoPlayEnabled ? styles.disabled : ''
                    } w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm`}
                    title='Toggle Auto Play (basic strategy)'
                  >
                    {autoPlayEnabled ? 'Auto Play: ON' : 'Auto Play: OFF'}
                  </button>
                </div>
              </div>
            ) : (
              <div className='min-h-[60px]'>
                {phase === 'player' && (
                  <div
                    className={`${styles.controlPanel} flex-col sm:flex-row gap-2 sm:gap-4`}
                  >
                    <button
                      onClick={hit}
                      className={`${styles.button} ${styles.hitButton} w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm`}
                    >
                      Hit
                    </button>
                    <button
                      onClick={stand}
                      className={`${styles.button} ${styles.standButton} w-full sm:w-auto py-3 sm:py-2 text-base sm:text-sm`}
                    >
                      Stand
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className='bg-green-700 rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 text-white text-center'>
          <p className='text-yellow-300 mt-1 sm:mt-2 text-lg sm:text-xl min-h-[24px] sm:min-h-[32px]'>
            {message}
          </p>
          <p className='text-xs sm:text-sm mt-1 opacity-80'>
            {autoPlayEnabled
              ? 'Auto Play enabled (basic strategy)'
              : 'Manual play'}
          </p>
        </div>
      </div>
      {/* Blackjack Game Introduction */}
      <div className='mt-4 sm:mt-10 bg-white/80 rounded-lg p-3 sm:p-6 max-w-3xl mx-auto shadow-lg text-gray-900'>
        <h2 className='text-xl sm:text-2xl font-bold mb-2'>
          Blackjack 1v1 Online – Rules & How to Play
        </h2>
        <p className='mb-3 sm:mb-4 text-sm sm:text-base'>
          Welcome to <strong>Blackjack 1v1</strong>! Play free blackjack online
          against our dealer bot and enjoy a realistic casino card game
          experience in your browser. Practice blackjack strategy, card
          counting, and betting tips as you try to beat the dealer and win
          chips. Whether you're a beginner or an advanced player, you can learn
          blackjack rules, practice your skills, and master the game.
        </p>
        <h3 className='text-lg sm:text-xl font-semibold mb-2'>
          How to Play Blackjack
        </h3>
        <ul className='list-disc ml-4 sm:ml-6 mb-3 sm:mb-4 text-sm sm:text-base'>
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
            If you run out of chips, you'll be prompted to reset your balance to
            1000 chips.
          </li>
        </ul>
        <h3 className='text-lg sm:text-xl font-semibold mb-2'>
          Auto Play Strategy Instruction
        </h3>
        <p className='mb-2 sm:mb-3 text-sm sm:text-base'>
          <strong>Auto Play</strong> uses a simplified <em>basic strategy</em>{' '}
          that considers only your current hand (hard/soft total) and the
          dealer's upcard. It never peeks at the deck or any hidden cards.
        </p>
        <ul className='list-disc ml-4 sm:ml-6 mb-2 sm:mb-3 text-sm sm:text-base'>
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
        <p className='mb-0 text-sm sm:text-base'>
          Toggle <strong>Auto Play</strong> with the button above. When enabled,
          it acts only on your turn with a short delay, then yields to the
          dealer as usual.
        </p>
        <p className='text-xs sm:text-sm text-gray-600'>
          Enjoy this online blackjack game and improve your skills. Play
          blackjack for fun, learn the rules, and test your luck against the
          dealer AI. Good luck!
        </p>
      </div>
    </div>
  )
}
