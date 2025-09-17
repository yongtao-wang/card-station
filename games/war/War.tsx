'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import { motion } from 'motion/react'
import styles from './warcard.module.css'

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
  'jack',
  'queen',
  'king',
  'ace',
] as const

type Suit = (typeof SUITS)[number]
type Rank = (typeof RANKS)[number]

interface Card {
  suit: Suit
  rank: Rank
  value: number
}

type GameState = 'init' | 'playing' | 'war' | 'checking' | 'gameOver'
const WAR_CARDS_COUNT = 5 // 1 original + 3 face down + 1 face up

const createDeck = (): Card[] => {
  const deck: Card[] = []
  SUITS.forEach((suit) => {
    RANKS.forEach((rank, index) => {
      deck.push({ suit, rank, value: index + 2 }) // value from 2 to 14 (ace)
    })
  })
  return shuffle(deck)
}

const shuffle = (array: Card[]): Card[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const cardBackImgUri = '/assets/img/cards/card_back.jpg'

const getCardSvgPath = (card: Card) => {
  return `/assets/img/cards/${card.rank}_of_${card.suit}.svg`
}

export default function War() {
  const [deck, setDeck] = useState<Card[]>([])
  const [gameState, setGameState] = useState<GameState>('init')
  const [playerDeck, setPlayerDeck] = useState<Card[]>([])
  const [botDeck, setBotDeck] = useState<Card[]>([])
  const [currentPlayerCard, setCurrentPlayerCard] = useState<Card[]>([])
  const [currentBotCard, setCurrentBotCard] = useState<Card[]>([])
  const [playerWonCards, setPlayerWonCards] = useState<Card[]>([])
  const [botWonCards, setBotWonCards] = useState<Card[]>([])
  const [isComparing, setIsComparing] = useState<boolean>(false)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [message, setMessage] = useState<string>(
    'Click "Deal" to start the game!'
  )

  const init = () => {
    const deck = shuffle(createDeck())
    setDeck(deck)
    setPlayerDeck(deck.slice(0, 26))
    setBotDeck(deck.slice(26))
    setPlayerWonCards([])
    setBotWonCards([])
    setCurrentPlayerCard([])
    setCurrentBotCard([])
    setGameState('playing')
    setMessage('Game started! Click on your top card to draw.')
  }

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'war') return

    // draw computer card in 'playing' and 'war' state
    if (
      ((gameState === 'playing' && currentBotCard.length === 0) ||
        (gameState === 'war' && currentBotCard.length < WAR_CARDS_COUNT)) &&
      !isComparing
    ) {
      console.log('Auto-drawing bot card')
      if (botDeck.length === 0) ReshuffleBot()
      // add random delay to simulate thinking time
      const timeout = Math.random() * (1000 - 200) + 200
      setTimeout(() => {
        drawComputerCard()
      }, timeout)
      return
    }

    // move to 'checking' state when both players have drawn required cards
    if (
      ((gameState === 'war' &&
        currentPlayerCard.length === WAR_CARDS_COUNT &&
        currentBotCard.length === WAR_CARDS_COUNT) ||
        (gameState === 'playing' &&
          currentPlayerCard.length === 1 &&
          currentBotCard.length === 1)) &&
      !isComparing
    ) {
      compareCards(currentBotCard, currentPlayerCard)
    }
  }, [currentPlayerCard, currentBotCard, gameState])

  const drawPlayerCard = () => {
    if (gameState !== 'playing' && gameState !== 'war') return
    if (gameState === 'playing' && currentPlayerCard.length > 0) return
    if (gameState === 'war' && currentPlayerCard.length >= WAR_CARDS_COUNT)
      return
    if (isComparing || isDrawing) return

    setIsDrawing(true)
    console.log('Player deck drawing')
    const drawnCard = playerDeck[0]
    const remainingDeck = playerDeck.slice(1)

    setCurrentPlayerCard([...currentPlayerCard, drawnCard])
    setPlayerDeck(remainingDeck)
    if (playerDeck.length === 0) ReshufflePlayer()

    // Release lock after animation time
    setTimeout(() => setIsDrawing(false), 100)
  }

  const drawComputerCard = () => {
    if (gameState !== 'playing' && gameState !== 'war') return
    if (gameState === 'playing' && currentBotCard.length > 0) return
    if (gameState === 'war' && currentBotCard.length >= WAR_CARDS_COUNT) return
    if (isComparing || isDrawing) return

    console.log('Bot deck drawing')
    const drawnCard = botDeck[0]
    const remainingDeck = botDeck.slice(1)

    setCurrentBotCard([...currentBotCard, drawnCard])
    setBotDeck(remainingDeck)
  }

  const compareCards = (botCards: Card[], playerCards: Card[]) => {
    if (botCards.length === 0 || playerCards.length === 0) return
    if (isComparing) return // Prevent double comparison
    console.log(
      'Comparing: bot cards:',
      ...botCards,
      'player cards: ',
      ...playerCards
    )
    setIsComparing(true)

    const curBotCards = botCards[botCards.length - 1]
    const curPlayerCards = playerCards[playerCards.length - 1]
    let roundWinner = null

    if (curPlayerCards.value > curBotCards.value) {
      setMessage('You win this round!')
      roundWinner = 'player'
    } else if (curBotCards.value > curPlayerCards.value) {
      setMessage('Computer wins this round!')
      roundWinner = 'bot'
    } else if (gameState === 'playing') {
      setMessage('War! Cards are equal!')
    } else {
      setMessage('War continues! Cards are equal again!')
    }

    // Clear current cards after comparison
    setTimeout(() => {
      if (roundWinner === null) {
        setGameState('war')
        setIsComparing(false)
        return
      }

      if (roundWinner === 'player')
        setPlayerWonCards((prev) => [...prev, ...botCards, ...playerCards])
      else if (roundWinner === 'bot')
        setBotWonCards((prev) => [...prev, ...botCards, ...playerCards])
      setGameState('playing')
      setCurrentPlayerCard([])
      setCurrentBotCard([])
      checkGameWinner()
    }, 1500)
    setIsComparing(false)
  }

  const ReshuffleBot = () => {
    if (botWonCards.length === 0) {
      setGameState('gameOver')
      setMessage('Computer has no more cards! You won the game!')
      return
    }
    setBotDeck(shuffle(botWonCards))
    setBotWonCards([])
  }

  const ReshufflePlayer = () => {
    if (playerWonCards.length === 0) {
      setGameState('gameOver')
      setMessage('You have no more cards! You lost the game.')
      return
    }
    setPlayerDeck(shuffle(playerWonCards))
    setPlayerWonCards([])
  }

  const checkGameWinner = () => {
    if (playerDeck.length === 0) ReshufflePlayer()
    if (botDeck.length === 0) ReshuffleBot()
    if (playerDeck.length === 0 && playerWonCards.length === 0) {
      setGameState('gameOver')
      setMessage('You have no more cards! You lost the game.')
    }
    if (botDeck.length === 0 && botWonCards.length === 0) {
      setGameState('gameOver')
      setMessage('Computer has no more cards! You won the game!')
    }
  }

  return (
    <div className={`${styles.game} sm:p-4`}>
      <motion.div
        className={`${styles.board} ${
          gameState === 'war' ? 'bg-red-900' : 'bg-green-900'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className='text-2xl sm:text-3xl font-bold text-white text-center p-4 sm:p-8'>
          War
        </h1>
        <div className='w-[60%] mx-auto my-2 sm:my-8 flex flex-col items-center justify-center gap-20'>
          <div className='grid grid-cols-3 gap-12 justify-items-center items-center'>
            <div></div>
            <div className={styles.deckSlot}>
              {/* Bot deck slot */}
              {botDeck.length > 0 && (
                <div className={styles.card}>
                  <Image
                    src={cardBackImgUri}
                    alt='Bot deck'
                    sizes='100vw'
                    fill
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded'>
                      {botDeck.length} cards
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className='flex items-center justify-center'>
              <span>BOT won {botWonCards.length} cards</span>
            </div>
          </div>
          <div className='flex flex-row justify-center w-1/2'>
            <div className={styles.slotsContainer}>
              <div className={styles.cardSlot}>
                {currentBotCard.length > 0 ? (
                  <motion.div
                    className={styles.card}
                    initial={{ x: 50, y: -150 }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={getCardSvgPath(
                        currentBotCard[currentBotCard.length - 1]
                      )}
                      alt={`${
                        currentBotCard[currentBotCard.length - 1].rank
                      } of ${currentBotCard[currentBotCard.length - 1].suit}`}
                      sizes='100vw'
                      fill
                    />
                  </motion.div>
                ) : (
                  <div className={styles.emptyCardSlot}>
                    <span className={styles.emptySlotText}>Bot Card</span>
                  </div>
                )}
              </div>
              <div className={styles.cardSlot}>
                {currentPlayerCard.length > 0 ? (
                  <motion.div
                    className={styles.card}
                    initial={{ x: -50, y: 150 }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={getCardSvgPath(
                        currentPlayerCard[currentPlayerCard.length - 1]
                      )}
                      alt={`${
                        currentPlayerCard[currentPlayerCard.length - 1].rank
                      } of ${
                        currentPlayerCard[currentPlayerCard.length - 1].suit
                      }`}
                      sizes='100vw'
                      fill
                    />
                  </motion.div>
                ) : (
                  <div className={styles.emptyCardSlot}>
                    <span className={styles.emptySlotText}>Player Card</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-12 justify-items-center'>
            <div className='flex items-center justify-center'>
              <span>PLAYER won {playerWonCards.length} cards</span>
            </div>
            <div className={styles.deckSlot}>
              {/* Player deck slot */}
              {playerDeck.length > 0 && (
                <motion.div
                  className={styles.card}
                  onClick={drawPlayerCard}
                  aria-disabled={
                    isComparing ||
                    isDrawing ||
                    ((gameState !== 'playing' ||
                      currentPlayerCard.length > 0) &&
                      (gameState !== 'war' ||
                        currentPlayerCard.length >= WAR_CARDS_COUNT))
                  }
                  style={{}}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={cardBackImgUri}
                    alt='Click to draw card'
                    sizes='100vw'
                    fill
                    className='object-contain'
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className='text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded'>
                      {playerDeck.length} cards
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div></div>
        </div>
        <div className='text-center mb-4'>
          {gameState === 'init' && (
            <motion.button
              className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
              onClick={init}
              whileTap={{ scale: 0.95 }}
            >
              Deal Cards
            </motion.button>
          )}
          {gameState === 'gameOver' && (
            <motion.button
              className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors'
              onClick={init}
              whileTap={{ scale: 0.95 }}
            >
              New Game
            </motion.button>
          )}
          <p className='text-white mt-2'>{message}</p>
        </div>
      </motion.div>
      <motion.div
        className={styles.howToPlay}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-xl sm:text-2xl font-bold mb-4 text-left text-gray-800'>
          War Game Rules
        </h2>
        <div className='text-sm sm:text-base space-y-4 leading-relaxed'>
          <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
            <p className='mb-2'>
              <strong>🎯 Overview:</strong> War is a simple yet exciting card
              game of pure chance. Each player gets half the deck (26 cards),
              and you battle by comparing the top cards. Higher card wins both
              cards. When cards tie, it's WAR!
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='font-bold text-green-800 mb-2'>🎮 How to Play</h3>
              <ul className='space-y-1 text-green-700 text-sm'>
                <li>• Each player starts with 26 cards face down</li>
                <li>• Click "Play Round" to reveal top cards</li>
                <li>• Higher card wins both cards</li>
                <li>• Won cards go to your won pile</li>
                <li>• When your deck runs out, won cards are shuffled back</li>
              </ul>
            </div>

            <div className='bg-orange-50 p-4 rounded-lg'>
              <h3 className='font-bold text-orange-800 mb-2'>⚔️ War Rules</h3>
              <ul className='space-y-1 text-orange-700 text-sm'>
                <li>• When cards tie in value → WAR!</li>
                <li>• Each player puts 3 cards face down</li>
                <li>• Then 1 card face up to determine winner</li>
                <li>• Winner takes all 10 cards on the table</li>
                <li>• If face up cards tie again → another WAR!</li>
              </ul>
            </div>
          </div>

          <div className='bg-red-50 p-4 rounded-lg border-l-4 border-red-500'>
            <h3 className='font-bold text-red-800 mb-2'>🏆 Winning & Losing</h3>
            <div className='text-red-700 space-y-2 text-sm'>
              <p>
                <strong>You win when:</strong> Computer runs out of all cards
              </p>
              <p>
                <strong>You lose when:</strong> You run out of all cards OR
                don't have enough cards to complete a war
              </p>
              <p>
                <strong>Card Values:</strong> 2 (lowest) → 3 → 4 → ... → Jack →
                Queen → King → Ace (highest)
              </p>
            </div>
          </div>

          <div className='text-center'>
            <p className='text-gray-600 italic text-sm'>
              War is a game of pure luck - no strategy needed! Just keep playing
              rounds and see who ends up with all 52 cards.
            </p>
          </div>
        </div>
        <p className='mt-4 text-sm text-gray-300'>
          <strong>Tip:</strong> War is a game of luck and suspense—enjoy the
          dramatic battles and see if you can claim all 52 cards!
        </p>
      </motion.div>
    </div>
  )
}
