'use client'

import './highlow.css'

import { useEffect, useState } from 'react'

import Image from 'next/image'

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
const CARD_WIDTH = 96
const CARD_HEIGHT = 144
const CARD_BACK = '/img/cards/card_back.jpg'

type Suit = (typeof SUITS)[number]
type Rank = (typeof RANKS)[number]

interface Card {
  suit: Suit
  rank: Rank
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

function getCardValue(rank: Rank) {
  if (rank === 'A') return 14
  if (rank === 'K') return 13
  if (rank === 'Q') return 12
  if (rank === 'J') return 11
  return parseInt(rank)
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

function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function HighLow() {
  const [deck, setDeck] = useState<Card[]>([])
  const [flippedCard, setFlippedCard] = useState<Card | null>(null)
  const [hiddenCard, setHiddenCard] = useState<Card | null>(null)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState<string>('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [disableFlipTransition, setDisableFlipTransition] = useState(false)
  const [flipNonce, setFlipNonce] = useState(0)

  useEffect(() => {
    const newDeck = shuffleDeck(createDeck())
    setDeck(newDeck.slice(2))
    setFlippedCard(newDeck[0])
    setHiddenCard(newDeck[1])
    setScore(0)
    setMessage('')
    setIsFlipped(false)
    setIsFlying(false)
    setIsMoving(false)
  }, [])

  function handleGuess(guess: 'higher' | 'lower' | 'exact') {
    if (!flippedCard || !hiddenCard) return
    const flippedValue = getCardValue(flippedCard.rank)
    const hiddenValue = getCardValue(hiddenCard.rank)
    let correct = false
    if (guess === 'higher' && hiddenValue > flippedValue) correct = true
    if (guess === 'lower' && hiddenValue < flippedValue) correct = true

    if (correct) {
      setScore((s) => s + 10)
      setMessage('Correct! +10 points')
    } else if (guess === 'exact' && hiddenValue === flippedValue) {
      setScore((s) => s + 20)
      setMessage('Exact! +20 points')
    } else {
      setMessage('Wrong guess!')
    }

    // Start flip animation: ensure we start from BACK and transition is enabled
    setDisableFlipTransition(false)
    setIsFlipped(false)
    setFlipNonce((n) => n + 1) // remount inner so browser sees a fresh 180deg state

    requestAnimationFrame(() => {
      setIsFlipped(true) // trigger 180deg -> 0deg with transition

      // After the face is revealed, start moving while keeping face visible
      setTimeout(() => {
        setIsFlying(true)
        setIsMoving(true)
      }, 450) // slightly longer than CSS 0.4s to be safe
    })
  }

  function resetGame() {
    const newDeck = shuffleDeck(createDeck())
    setDeck(newDeck.slice(2))
    setFlippedCard(newDeck[0])
    setHiddenCard(newDeck[1])
    setScore(0)
    setMessage('')
    setIsFlipped(false)
    setIsFlying(false)
    setIsMoving(false)
  }

  return (
    <div className='min-h-screen bg-green-900 flex flex-col items-center p-4'>
      <h1 className='text-3xl font-bold text-white my-4'>High-Low Card Game</h1>
      <div className='mb-4 text-white text-lg'>Score: {score}</div>
      <div className='mb-4 text-amber-300'>
        Deck Remaining: {deck.length} cards
      </div>
      <div className='flex gap-8 mb-8'>
        <div className='flex flex-col items-center'>
          <span className='text-white mb-2'>Previous Card</span>
          {flippedCard ? (
            <div className={`relative w-24 h-36`}>
              <Image
                src={getCardSvgPath(flippedCard)}
                alt={`${flippedCard.rank} of ${flippedCard.suit}`}
                className={`w-24 h-36 rounded shadow transition-all duration-500 ${
                  isFlying ? 'fly-left' : ''
                }`}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                style={{ position: 'absolute', left: 0, top: 0 }}
                onAnimationEnd={() => {
                  if (isFlying) {
                    let nextDeck = [...deck]
                    const nextFlipped = hiddenCard
                    const nextHidden = nextDeck.length > 0 ? nextDeck[0] : null
                    nextDeck = nextDeck.slice(1)
                    setFlippedCard(nextFlipped)
                    setHiddenCard(nextHidden)
                    setDeck(nextDeck)
                    setMessage('')
                    setIsFlipped(false)
                    setIsFlying(false)
                    setIsMoving(false)
                  }
                }}
              />
            </div>
          ) : (
            <div className='w-24 h-36 bg-gray-700 rounded' />
          )}
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-white mb-2'>New Card</span>
          {hiddenCard ? (
            <div className='relative w-24 h-36'>
              <div
                key={`${hiddenCard?.suit}-${hiddenCard?.rank}-${score}`}
                className={`flip-card-container ${
                  disableFlipTransition ? 'no-flip-transition' : ''
                } ${isFlipped ? 'flipped' : ''} ${
                  isMoving ? 'move-to-flipped' : ''
                }`}
                style={{ position: 'absolute', left: 0, top: 0 }}
              >
                <div className='flip-card-inner' key={flipNonce}>
                  <div className='flip-card-front'>
                    <Image
                      src={getCardSvgPath(hiddenCard)}
                      alt={`${hiddenCard.rank} of ${hiddenCard.suit}`}
                      className='rounded shadow'
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                    />
                  </div>
                  <div className='flip-card-back'>
                    <Image
                      src={CARD_BACK}
                      alt='Hidden card'
                      className='rounded shadow'
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='w-24 h-36 bg-gray-700 rounded' />
          )}
        </div>
      </div>
      <div className='mb-4'>
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold mx-2'
          onClick={() => handleGuess('higher')}
          disabled={!hiddenCard || !!message}
        >
          Higher
        </button>
        <button
          className='bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold mx-2'
          onClick={() => {
            handleGuess('exact')
          }}
          disabled={!hiddenCard || !!message}
        >
          Exact!
        </button>
        <button
          className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold mx-2'
          onClick={() => handleGuess('lower')}
          disabled={!hiddenCard || !!message}
        >
          Lower
        </button>
        <button
          className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold mx-2'
          onClick={resetGame}
        >
          Reset
        </button>
      </div>
      <div className='text-yellow-300 text-lg min-h-[32px]'>{message}</div>
      {!hiddenCard && (
        <div className='mt-8 text-white text-center'>
          <p>Game Over! Final Score: {score}</p>
          <button
            className='mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold'
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
      <div className='mt-10 bg-white/80 rounded-lg p-6 max-w-3xl mx-auto shadow-lg text-gray-900'>
        <h2 className='text-2xl font-bold mb-2'>How to Play High-Low</h2>
        <p>
          Try to guess if the hidden card is higher, lower, or exactly equal to the flipped card.<br />
          If you guess <strong>higher</strong> or <strong>lower</strong> correctly, you earn <strong>10 points</strong> and move to the next round.<br />
          If you guess <strong>Exact!</strong> and the cards match, you earn <strong>20 points</strong>.<br />
          The flipped card is discarded, and the hidden card becomes the new flipped card. Play until the deck runs out. Good luck!
        </p>
      </div>
    </div>
  )
}
