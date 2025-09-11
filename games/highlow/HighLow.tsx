'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'
import styles from './highlow.module.css'

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

type GameState = 'playing' | 'gameOver' | 'starting'
type Guess = 'higher' | 'lower'

// Create a full deck of cards
function createDeck(): Card[] {
  const deck: Card[] = []
  SUITS.forEach((suit) => {
    RANKS.forEach((rank, index) => {
      deck.push({
        suit,
        rank,
        value: index + 2, // 2-14 (ace is high)
      })
    })
  })
  return shuffleDeck(deck)
}

// Shuffle deck using Fisher-Yates algorithm
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get SVG path for card
function getCardSvgPath(card: Card): string {
  return `/assets/img/cards/${card.rank}_of_${card.suit}.svg`
}

// Animation variants
const cardVariants = {
  hidden: {
    rotateY: 180,
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    rotateY: 0,
    scale: 1,
    opacity: 1,
  },
  flip: {
    rotateY: [0, 90, 0],
  },
  exit: {
    x: -200,
    opacity: 0,
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
}

const scoreVariants = {
  correct: {
    scale: [1, 1.2, 1],
    color: '#10b981',
    transition: {
      duration: 0.3,
    },
  },
  incorrect: {
    scale: [1, 1.2, 1],
    color: '#ef4444',
    transition: {
      duration: 0.5,
    },
  },
}

export default function HighLow() {
  const [deck, setDeck] = useState<Card[]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [nextCard, setNextCard] = useState<Card | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [gameState, setGameState] = useState<GameState>('starting')
  const [isFlipping, setIsFlipping] = useState(false)
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null)
  const [cardsRemaining, setCardsRemaining] = useState(52)

  // Initialize game
  const initializeGame = useCallback(() => {
    const newDeck = createDeck()
    setDeck(newDeck)
    setCurrentCard(newDeck[0])
    setNextCard(newDeck[1])
    setScore(0)
    setStreak(0)
    setCardsRemaining(51)
    setGameState('playing')
    setLastGuessCorrect(null)
  }, [])

  // Start game on component mount
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Load best streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('highlow-best-streak')
    if (saved) {
      setBestStreak(parseInt(saved, 10))
    }
  }, [])

  // Save best streak to localStorage
  useEffect(() => {
    if (streak > bestStreak) {
      setBestStreak(streak)
      localStorage.setItem('highlow-best-streak', streak.toString())
    }
  }, [streak, bestStreak])

  // Handle guess
  const makeGuess = async (guess: Guess) => {
    if (!currentCard || !nextCard || isFlipping || gameState !== 'playing')
      return

    setIsFlipping(true)

    // Check if guess is correct
    const isCorrect =
      (guess === 'higher' && nextCard.value > currentCard.value) ||
      (guess === 'lower' && nextCard.value < currentCard.value) ||
      nextCard.value === currentCard.value // Ties count as correct

    setLastGuessCorrect(isCorrect)

    // Wait for flip animation
    await new Promise((resolve) => setTimeout(resolve, 400))

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setStreak((prev) => prev + 1)

      // Move to next card
      const currentIndex = deck.findIndex(
        (card) => card.suit === nextCard.suit && card.rank === nextCard.rank
      )

      if (currentIndex >= deck.length - 1) {
        // Game over - ran out of cards
        setGameState('gameOver')
      } else {
        setCurrentCard(nextCard)
        setNextCard(deck[currentIndex + 1])
        setCardsRemaining(deck.length - currentIndex - 1)
      }
    } else {
      // Game over
      setStreak(0)
      setGameState('gameOver')
    }

    setIsFlipping(false)
  }

  const resetGame = () => {
    initializeGame()
  }

  return (
    <div className={styles.game}>
      {/* Game Board */}
      <motion.div
        className={`${styles.board}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.h1
          className={styles.gameTitle}
          variants={scoreVariants}
          animate={
            lastGuessCorrect === true
              ? 'correct'
              : lastGuessCorrect === false
              ? 'incorrect'
              : ''
          }
        >
          High Low Card Game
        </motion.h1>

        {/* Score Display */}
        <motion.div
          className='flex justify-between items-center mb-6 text-white'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-center'>
            <div className='text-lg font-bold'>Score</div>
            <motion.div
              className='text-2xl'
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {score}
            </motion.div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold'>Current Streak</div>
            <motion.div
              className='text-2xl text-yellow-400'
              key={streak}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {streak}
            </motion.div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold'>Best Streak</div>
            <div className='text-2xl text-orange-400'>{bestStreak}</div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold'>Cards Left</div>
            <div className='text-2xl'>{cardsRemaining}</div>
          </div>
        </motion.div>

        {/* Cards Display */}
        <div className='flex justify-center items-center gap-8 mb-8'>
          {/* Current Card */}
          <div className='flex flex-col items-center text-center'>
            <div className='text-white mb-2 font-semibold'>Current Card</div>
            <AnimatePresence mode='wait'>
              {currentCard && (
                <motion.div
                  key={`${currentCard.suit}-${currentCard.rank}`}
                  className={styles.card}
                  variants={cardVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{
                    scale: 1.1,
                    rotate: -5,
                    zIndex: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    cursor: 'grabbing',
                  }}
                  style={{
                    backgroundImage: `url(${getCardSvgPath(currentCard)})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* <Image
                    src={getCardSvgPath(currentCard)}
                    alt={`${currentCard.rank} of ${currentCard.suit}`}
                    fill
                    className="object-contain"
                  /> */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VS Text */}
          <motion.div
            className='text-white text-4xl font-bold'
            animate={{
              scale: isFlipping ? [1, 1.2, 1] : 1,
              color: isFlipping ? ['#ffffff', '#fbbf24', '#ffffff'] : '#ffffff',
            }}
            transition={{ duration: 0.5 }}
          >
            VS
          </motion.div>

          {/* Next Card */}
          <div className='flex flex-col items-center text-center'>
            <div className='text-white mb-2 font-semibold'>Next Card</div>
            <AnimatePresence mode='wait'>
              {gameState === 'playing' && (
                <motion.div
                  className={styles.card}
                  variants={cardVariants}
                  initial='hidden'
                  animate={isFlipping ? 'flip' : 'visible'}
                  exit='exit'
                  transition={
                    isFlipping
                      ? { duration: 0.8, ease: 'easeInOut' }
                      : { duration: 0.6, ease: 'easeOut' }
                  }
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{
                    scale: 1.1,
                    rotate: -5,
                    zIndex: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    cursor: 'grabbing',
                  }}
                >
                  {isFlipping && nextCard ? (
                    <Image
                      src={getCardSvgPath(nextCard)}
                      alt={`${nextCard.rank} of ${nextCard.suit}`}
                      fill
                      className='object-contain pointer-events-none'
                    />
                  ) : (
                    <Image
                      src='/assets/img/cards/card_back.jpg'
                      alt='Card back'
                      fill
                      className='object-contain pointer-events-none'
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Game Controls */}
        <AnimatePresence mode='wait'>
          {gameState === 'playing' && (
            <motion.div
              className='flex justify-center gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg'
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
                onClick={() => makeGuess('lower')}
              >
                Lower
              </motion.button>
              <motion.button
                className='bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg'
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
                onClick={() => makeGuess('higher')}
              >
                Higher
              </motion.button>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              className='text-center'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className='text-white text-2xl font-bold mb-4'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Game Over!
              </motion.div>
              <motion.div
                className='text-white text-lg mb-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Final Score: {score} {score === 1 ? 'point' : 'points'}
                {streak === bestStreak && streak > 0 && (
                  <div className='text-yellow-400 mt-2'>
                    🎉 New Best Streak!
                  </div>
                )}
              </motion.div>
              <motion.button
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg'
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
                onClick={resetGame}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* How to Play Section */}
      <motion.div
        className={`${styles.howToPlay}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-lg sm:text-xl font-bold mb-3 text-center'>
          How to Play High Low
        </h2>
        <div className='text-sm sm:text-base space-y-2'>
          <p>
            🎯 <strong>Objective:</strong> Guess whether the next card will be
            higher or lower than the current card.
          </p>
          <p>
            📊 <strong>Scoring:</strong> Each correct guess earns 1 point. Ties
            count as correct!
          </p>
          <p>
            🔄 <strong>Game Over:</strong> One wrong guess ends the game. Try to
            beat your best streak!
          </p>
          <p>
            🃏 <strong>Card Values:</strong> 2 is lowest, Ace is highest (2, 3,
            4, 5, 6, 7, 8, 9, 10, J, Q, K, A)
          </p>
        </div>
      </motion.div>
    </div>
  )
}
