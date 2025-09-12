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
        <h2 className='text-xl sm:text-2xl font-bold mb-4 text-center text-gray-800'>
          Master the High Low Card Game
        </h2>
        
        <div className='text-sm sm:text-base space-y-4 leading-relaxed'>
          <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
            <p className='mb-2'>
              <strong>🎯 Game Overview:</strong> High Low is a thrilling card prediction game that tests your intuition and probability skills. 
              You'll be presented with one face-up card and must predict whether the next hidden card will have a higher or lower value. 
              It's simple to learn but challenging to master!
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='font-bold text-green-800 mb-2'>🎮 How to Play</h3>
              <ul className='space-y-1 text-green-700'>
                <li>• Look at the current card shown</li>
                <li>• Decide if the next card will be higher or lower</li>
                <li>• Click "Higher" or "Lower" to make your guess</li>
                <li>• Watch the card flip to reveal your fate!</li>
                <li>• Continue your streak as long as possible</li>
              </ul>
            </div>

            <div className='bg-orange-50 p-4 rounded-lg'>
              <h3 className='font-bold text-orange-800 mb-2'>🃏 Card Values</h3>
              <p className='text-orange-700 mb-2'>From lowest to highest:</p>
              <div className='text-orange-700 font-mono text-sm'>
                2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → J → Q → K → A
              </div>
              <p className='text-xs text-orange-600 mt-2'>Ace is always high (value 14)</p>
            </div>
          </div>

          <div className='bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500'>
            <h3 className='font-bold text-yellow-800 mb-2'>📊 Scoring & Strategy</h3>
            <div className='text-yellow-700 space-y-2'>
              <p><strong>Points:</strong> Earn 1 point for each correct guess. Ties count as correct!</p>
              <p><strong>Streaks:</strong> Chain together correct guesses to build impressive streaks.</p>
              <p><strong>Strategy Tip:</strong> Pay attention to probability! If you see a 3, the next card is very likely to be higher. 
              If you see a King, it's probably going to be lower.</p>
            </div>
          </div>

          <div className='bg-red-50 p-4 rounded-lg border-l-4 border-red-500'>
            <h3 className='font-bold text-red-800 mb-2'>⚠️ Game Over Conditions</h3>
            <div className='text-red-700 space-y-2'>
              <p><strong>Wrong Guess:</strong> One incorrect prediction ends your current run.</p>
              <p><strong>Deck Exhausted:</strong> Successfully guess through the entire deck for ultimate victory!</p>
              <p><strong>Challenge:</strong> Can you beat your personal best streak? The game saves your highest score locally.</p>
            </div>
          </div>

          <div className='bg-purple-50 p-4 rounded-lg text-center'>
            <h3 className='font-bold text-purple-800 mb-2'>� Pro Tips</h3>
            <div className='text-purple-700 text-sm space-y-1'>
              <p>• Cards 2-6: Usually guess "Higher" • Cards J-A: Usually guess "Lower"</p>
              <p>• Cards 7-9: These are tricky! Consider what cards you've already seen</p>
              <p>• Remember: This game is about probability, not luck. Think before you guess!</p>
            </div>
          </div>

          <div className='text-center mt-4'>
            <p className='text-gray-600 italic'>
              Ready to test your prediction skills? Start guessing and see how long you can keep your streak alive! 
              The cards are shuffled randomly each game, so every round is a fresh challenge.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
