'use client'

import './warcard.css'

import { useEffect, useState } from 'react'

import Image from 'next/image'

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

const CARD_WIDTH = '80'
const CARD_HEIGHT = '110'
const CARD_WIDTH_PX = CARD_WIDTH + 'px'
const CARD_HEIGHT_PX = CARD_HEIGHT + 'px'

// Create a standard 52-card deck
function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

function shuffle(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getCardValue(rank: Rank): number {
  if (rank === 'A') return 14
  if (rank === 'K') return 13
  if (rank === 'Q') return 12
  if (rank === 'J') return 11
  return parseInt(rank)
}

function getCardSvgPath(card: Card): string {
  // Map rank and suit to filename, e.g. "ace_of_spades.svg", "10_of_hearts.svg"
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

function getDeckPath(): string {
  return '/img/cards/deck.svg'
}

export default function War() {
  const [playerDeck, setPlayerDeck] = useState<Card[]>([])
  const [botDeck, setBotDeck] = useState<Card[]>([])
  const [pile, setPile] = useState<Card[]>([])
  const [playerCard, setPlayerCard] = useState<Card | null>(null)
  const [botCard, setBotCard] = useState<Card | null>(null)
  const [message, setMessage] = useState<string>('')
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [started, setStarted] = useState<boolean>(false)
  const [animating, setAnimating] = useState<boolean>(false)
  const [revealed, setRevealed] = useState<boolean>(false)

  useEffect(() => {
    // Only shuffle and set up decks when game is reset or started
    setPlayerDeck([])
    setBotDeck([])
    setPile([])
    setPlayerCard(null)
    setBotCard(null)
    setMessage('Click Start Playing to begin!')
    setGameOver(false)
    setStarted(false)
  }, [])

  const startGame = () => {
    const deck = shuffle(createDeck())
    setPlayerDeck(deck.slice(0, 26))
    setBotDeck(deck.slice(26))
    setPile([])
    setPlayerCard(null)
    setBotCard(null)
    setMessage('Game started!')
    setGameOver(false)
    setStarted(true)
  }

  const playRound = () => {
    if (gameOver || animating) return
    if (playerDeck.length === 0 || botDeck.length === 0) {
      setGameOver(true)
      setMessage(playerDeck.length === 0 ? 'Bot wins!' : 'You win!')
      return
    }
    const pCard = playerDeck[0]
    const bCard = botDeck[0]
    setPlayerCard(pCard)
    setBotCard(bCard)
    setAnimating(true)
    setRevealed(false)
    // Animate fly-in, then flip after 1s
    setTimeout(() => {
      setRevealed(true)
      // After reveal, highlight winner/loser, then update decks after 1s
      setTimeout(() => {
        let newPlayerDeck = playerDeck.slice(1)
        let newBotDeck = botDeck.slice(1)
        let newPile = [...pile, pCard, bCard]
        const pVal = getCardValue(pCard.rank)
        const bVal = getCardValue(bCard.rank)
        if (pVal > bVal) {
          setMessage('You win the round!')
          setPlayerDeck([...newPlayerDeck, ...newPile])
          setBotDeck(newBotDeck)
          setPile([])
        } else if (bVal > pVal) {
          setMessage('Bot wins the round!')
          setBotDeck([...newBotDeck, ...newPile])
          setPlayerDeck(newPlayerDeck)
          setPile([])
        } else {
          setMessage('War!')
          setPlayerDeck(newPlayerDeck)
          setBotDeck(newBotDeck)
          setPile(newPile)
        }
        setAnimating(false)
      }, 1000)
    }, 1000)
  }

  const resetGame = () => {
    const deck = shuffle(createDeck())
    setPlayerDeck(deck.slice(0, 26))
    setBotDeck(deck.slice(26))
    setPile([])
    setPlayerCard(null)
    setBotCard(null)
    setMessage('Game restarted!')
    setGameOver(false)
    setStarted(true)
  }

  return (
    <div className='min-h-screen bg-green-900 p-4'>
      <div className='max-w-xl mx-auto'>
        <h1 className='text-3xl font-bold text-white text-center mb-6'>
          War Card Game
        </h1>
        {/* Bot Deck (top) */}
        <div className='flex justify-center items-center mb-2'>
          <div className='flex items-center'>
            <div
              className={`bg-gray-700 rounded-lg min-w-[${CARD_WIDTH_PX}]] min-h-[${CARD_HEIGHT_PX}] flex items-center justify-center text-white shadow-lg m-4`}
            >
              <Image
                src={getDeckPath()}
                alt='Bot Deck'
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                priority
              />
            </div>
            <div className='flex flex-col text-left ml-8'>
              <p className='text-white text-3xl'>Bot</p>
              <span className=' text-gray-300 mt-2'>
                {botDeck.length} cards
              </span>
            </div>
          </div>
        </div>
        {/* Center board: animated cards */}
        <div
          className='flex justify-center items-center gap-16 mb-6 relative'
          style={{ height: '120px' }}
        >
          {/* Bot card fly-in */}
          <div
            style={{
              position: 'relative',
              width: CARD_WIDTH_PX,
              height: CARD_HEIGHT_PX,
            }}
          >
            {/* Flip animation during animating */}
            {botCard && animating && (
              <div
                className='card-fly-in'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <div
                  className={`card-flip${revealed ? ' flipped' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Card back: JPG image */}
                  <div className='card-face card-back'>
                    <Image
                      src='/img/cards/card_back.jpg'
                      alt='Card Back'
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                      priority
                    />
                  </div>
                  {/* Card front: SVG */}
                  <div
                    className='card-face'
                    style={{
                      transform: 'rotateY(180deg)',
                      borderRadius: '0.5rem',
                      background: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src={getCardSvgPath(botCard)}
                      alt={`${botCard.rank} of ${botCard.suit}`}
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                      priority
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Winner/loser highlight only after animation */}
            {botCard && revealed && !animating && (
              <div
                className={`card-flip ${
                  getCardValue(botCard.rank) > getCardValue(playerCard!.rank)
                    ? 'card-winner'
                    : getCardValue(botCard.rank) <
                      getCardValue(playerCard!.rank)
                    ? 'card-loser'
                    : ''
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <div
                  className='card-face'
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '0.5rem',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={getCardSvgPath(botCard)}
                    alt={`${botCard.rank} of ${botCard.suit}`}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    priority
                  />
                </div>
              </div>
            )}
          </div>
          {/* Player card fly-in */}
          <div
            style={{
              position: 'relative',
              width: CARD_WIDTH_PX,
              height: CARD_HEIGHT_PX,
            }}
          >
            {/* Flip animation during animating */}
            {playerCard && animating && (
              <div
                className='card-fly-in-player'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <div
                  className={`card-flip${revealed ? ' flipped' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Card back: SVG image */}
                  <div className='card-face card-back'>
                    <Image
                      src='/img/cards/card_back.jpg'
                      alt='Card Back'
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                      priority
                    />
                  </div>
                  {/* Card front: SVG */}
                  <div
                    className='card-face'
                    style={{
                      transform: 'rotateY(180deg)',
                      width: '100%',
                      height: '100%',
                      borderRadius: '0.5rem',
                      background: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src={getCardSvgPath(playerCard)}
                      alt={`${playerCard.rank} of ${playerCard.suit}`}
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                      priority
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Winner/loser highlight only after animation */}
            {playerCard && revealed && !animating && (
              <div
                className={`card-flip ${
                  getCardValue(playerCard.rank) > getCardValue(botCard!.rank)
                    ? 'card-winner'
                    : getCardValue(playerCard.rank) <
                      getCardValue(botCard!.rank)
                    ? 'card-loser'
                    : ''
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <div
                  className='card-face'
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '0.5rem',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={getCardSvgPath(playerCard)}
                    alt={`${playerCard.rank} of ${playerCard.suit}`}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Player Deck (bottom) */}
        <div className='flex justify-center items-center mt-2 mb-6'>
          <div className='flex items-center'>
            <div className='flex flex-col mr-8'>
              <p className='text-3xl text-white'>You</p>
              <span className='text-gray-300 mt-2'>
                {playerDeck.length} cards
              </span>
            </div>
            <div
              className={`bg-gray-700 rounded-lg min-w-[${CARD_WIDTH_PX}]] min-h-[${CARD_HEIGHT_PX}] flex items-center justify-center text-white shadow-lg m-4`}
            >
              <Image
                src={getDeckPath()}
                alt='Your Deck'
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                priority
              />
            </div>
          </div>
        </div>
        {/* Message section */}
        <div className='text-center m-12'>
          <span className='text-lg text-yellow-200 font-semibold'>{message}</span>
        </div>
        <div className='text-center mb-4'>
          {!started ? (
            <button
              onClick={startGame}
              className='bg-lime-500 hover:bg-lime-600 text-white px-8 py-3 rounded-lg font-semibold text-lg'
            >
              Start Playing
            </button>
          ) : (
            <>
              <button
                onClick={playRound}
                disabled={gameOver || animating}
                className='bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg'
              >
                Play Round
              </button>
              <button
                onClick={resetGame}
                disabled={animating}
                className='bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg ml-4'
              >
                Reset Game
              </button>
            </>
          )}
        </div>
        {/* Game rules section */}
        <div className='max-w-xl mx-auto bg-gray-800 rounded-lg p-4 m-32 text-white text-left shadow-lg'>
          <h2 className='text-xl font-bold mb-2'>How to Play</h2>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Each player starts with half the deck (26 cards).</li>
            <li>Click "Play Round" to flip the top card of each deck.</li>
            <li>
              The higher card wins both cards and adds them to the bottom of their
              deck.
            </li>
            <li>
              If both cards are equal, it's "War": the cards go to a pile and the
              next round decides who wins the pile.
            </li>
            <li>
              The game ends when one player has all the cards.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
