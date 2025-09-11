'use client'

import { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'
import { motion } from 'motion/react'
import styles from './snap.module.css'

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
const RANKS = ['10', 'J', 'Q', 'K', 'A'] as const

const SNAP_DELAY = 1200

type Suit = (typeof SUITS)[number]
type Rank = (typeof RANKS)[number]

interface Card {
  suit: Suit
  rank: Rank
}

interface Player {
  id: string
  name: string
  deck: Card[]
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
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getCardSvgPath(card: Card): string {
  const rankMap: Record<Rank, string> = {
    A: 'ace',
    K: 'king',
    Q: 'queen',
    J: 'jack',
    '10': '10',
  }
  return `/assets/img/cards/${rankMap[card.rank]}_of_${card.suit}.svg`
}

export default function Snap() {
  const [players, setPlayers] = useState<Player[]>([])
  const [centralPile, setCentralPile] = useState<Card[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [gameState, setGameState] = useState<
    'setup' | 'playing' | 'snap' | 'gameOver'
  >('setup')
  const [message, setMessage] = useState('')
  const [snapWindow, setSnapWindow] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [playerSlots, setPlayerSlots] = useState<(Card | null)[]>([null, null]) // [player, bot]
  const [animatingCard, setAnimatingCard] = useState<{
    playerIndex: number
    card: Card
    stage: 'flyIn'
  } | null>(null)
  const [snapAnimation, setSnapAnimation] = useState<{
    winnerIndex: number
    cards: Card[]
  } | null>(null)
  const [snapInProgress, setSnapInProgress] = useState(false) // Lock to prevent race condition
  const [showSnapBadge, setShowSnapBadge] = useState<number | null>(null) // Show snap badge for player index

  // Initialize game
  useEffect(() => {
    const fullDeck = shuffleDeck(createDeck())

    setPlayers([
      { id: 'player', name: 'You', deck: [...fullDeck] },
      { id: 'bot', name: 'Bot', deck: shuffleDeck([...fullDeck]) },
    ])
    setCentralPile([])
    setCurrentPlayer(0)
    setGameState('playing')
    setMessage('Your turn - Click "Play Card" to start!')
    setPlayerSlots([null, null])
    setAnimatingCard(null)
    setSnapInProgress(false) // Initialize lock as false
    setShowSnapBadge(null) // Initialize snap badge
  }, [])

  // Check for matching cards (snap condition)
  const checkForSnap = useCallback((pile: Card[]) => {
    if (pile.length < 2) return false
    return pile[pile.length - 1].rank === pile[pile.length - 2].rank
  }, [])

  // Check if player slots have matching cards
  const checkSlotsForSnap = useCallback(() => {
    return (
      playerSlots[0] &&
      playerSlots[1] &&
      playerSlots[0].rank === playerSlots[1].rank
    )
  }, [playerSlots])

  // Play a card with animation
  const playCard = () => {
    if (
      gameState !== 'playing' ||
      players[currentPlayer].deck.length === 0 ||
      animatingCard
    )
      return

    const newPlayers = [...players]
    const newCard = newPlayers[currentPlayer].deck.pop()!

    // Check if current player runs out of cards after drawing
    if (newPlayers[currentPlayer].deck.length === 0) {
      const otherPlayer = currentPlayer === 0 ? 1 : 0
      setWinner(newPlayers[otherPlayer].name)
      setGameState('gameOver')
      setMessage(
        `${newPlayers[otherPlayer].name} wins! ${newPlayers[currentPlayer].name} ran out of cards.`
      )
      return
    }

    // Start fly-in animation for new card
    setAnimatingCard({
      playerIndex: currentPlayer,
      card: newCard,
      stage: 'flyIn',
    })
    setPlayers(newPlayers)
  }

  // Handle animation completion
  const handleAnimationEnd = () => {
    if (!animatingCard) return

    const { playerIndex, card } = animatingCard

    // If there's already a card in the slot, add it to central pile
    let updatedCentralPile = centralPile
    if (playerSlots[playerIndex]) {
      updatedCentralPile = [...centralPile, playerSlots[playerIndex]!]
      setCentralPile(updatedCentralPile)
    }

    // Place new card in slot
    const newSlots = [...playerSlots]
    newSlots[playerIndex] = card
    setPlayerSlots(newSlots)
    setAnimatingCard(null)

    // Check for snap condition after state updates
    setTimeout(() => {
      // Check if both slots have cards and they match
      if (newSlots[0] && newSlots[1] && newSlots[0].rank === newSlots[1].rank) {
        setMessage('SNAP! Two matching cards! Be quick to click SNAP!')
      } else {
        // Switch to next player only if no snap condition
        setCurrentPlayer(playerIndex === 0 ? 1 : 0)
        const nextPlayerName = playerIndex === 0 ? 'Bot' : 'You'
        setMessage(`${nextPlayerName}'s turn`)
      }
    }, 200)
  }

  // Bot auto-play
  useEffect(() => {
    if (
      gameState === 'playing' &&
      currentPlayer === 1 &&
      players[1]?.deck.length > 0 &&
      !animatingCard
    ) {
      // Longer delay if bot just won a snap, shorter delay for normal play
      const wasSnapWinner = showSnapBadge === 1
      const delay = wasSnapWinner ? 3000 : 1500 // 3 seconds after snap win, 1.5 seconds normally

      const timer = setTimeout(() => {
        playCard()
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [gameState, currentPlayer, players, animatingCard, showSnapBadge])

  // Bot auto-snap with reaction time
  useEffect(() => {
    if (gameState === 'playing' && checkSlotsForSnap() && !snapInProgress) {
      const botReactionTime = Math.random() * 1000 + 200 // 0.2-1.2 seconds
      const timer = setTimeout(() => {
        if (gameState === 'playing' && checkSlotsForSnap() && !snapInProgress) {
          handleSnap(1) // Bot wins the snap
        }
      }, botReactionTime)
      return () => clearTimeout(timer)
    }
  }, [playerSlots, gameState, checkSlotsForSnap, snapInProgress])

  // Handle snap
  const handleSnap = (playerIndex: number) => {
    // Check if snap is already in progress to prevent race condition
    if (snapInProgress) {
      return
    }

    // Set lock to prevent concurrent snaps
    setSnapInProgress(true)

    const newPlayers = [...players]

    // Determine the winner and collect all cards
    let winnerIndex: number
    let allPiledCards: Card[] = shuffleDeck([...centralPile])
    if (playerSlots[0]) allPiledCards.push(playerSlots[0])
    if (playerSlots[1]) allPiledCards.push(playerSlots[1])

    // Check if it's a valid snap (matching cards in player slots)
    if (
      playerSlots[0] &&
      playerSlots[1] &&
      playerSlots[0].rank === playerSlots[1].rank
    ) {
      // Correct snap - winner gets all cards (add to back of deck)
      winnerIndex = playerIndex
      newPlayers[playerIndex].deck = [
        ...allPiledCards,
        ...newPlayers[playerIndex].deck,
      ]
      setMessage(`${newPlayers[playerIndex].name} wins the pile!`)

      // Show snap badge for successful snap
      setShowSnapBadge(playerIndex)
      setTimeout(() => setShowSnapBadge(null), SNAP_DELAY)
    } else {
      // Incorrect snap - other player gets all cards (add to back of deck)
      const otherPlayer = playerIndex === 0 ? 1 : 0
      winnerIndex = otherPlayer
      newPlayers[otherPlayer].deck = [
        ...allPiledCards,
        ...newPlayers[otherPlayer].deck,
      ]
      setMessage(`Wrong snap! ${newPlayers[otherPlayer].name} gets the pile!`)
    }

    // Start snap animation after a delay to align with snap badge
    const slotsCards: Card[] = []
    if (playerSlots[0]) slotsCards.push(playerSlots[0])
    if (playerSlots[1]) slotsCards.push(playerSlots[1])

    setTimeout(() => {
      setSnapAnimation({
        winnerIndex,
        cards: slotsCards,
      })
    }, SNAP_DELAY)

    // Update game state immediately
    setPlayers(newPlayers)
    setCentralPile([])
    setGameState('playing')
    setCurrentPlayer(playerIndex)
    setSnapWindow(false)
  }

  // Handle snap animation completion
  const handleSnapAnimationEnd = () => {
    setSnapAnimation(null)
    setPlayerSlots([null, null]) // Clear slots after animation
    setSnapInProgress(false) // Release lock after animation completes
  }

  // Reset game
  const resetGame = () => {
    const fullDeck = shuffleDeck(createDeck())

    setPlayers([
      { id: 'player', name: 'You', deck: [...fullDeck] },
      { id: 'bot', name: 'Bot', deck: shuffleDeck([...fullDeck]) },
    ])
    setCentralPile([])
    setCurrentPlayer(0)
    setGameState('playing')
    setMessage('Your turn - Click "Play Card" to start!')
    setSnapWindow(false)
    setWinner(null)
    setPlayerSlots([null, null])
    setAnimatingCard(null)
    setSnapAnimation(null)
    setSnapInProgress(false) // Reset lock
    setShowSnapBadge(null) // Reset snap badge
  }

  return (
    <div className={`${styles.game} sm:p-4`}>
      <motion.div
        className={`${styles.board}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className={`${styles.gameTitle}`}>Snap!</h1>

        {/* Game Info */}
        <div className='flex justify-between items-center m-2 mx-4 sm:mx-8'>
          <div>
            <p className='font-semibold min-h-[28px]'>{players[1]?.name}</p>
            <p>Cards: {players[1]?.deck.length}</p>
          </div>
          <div>
            <p className='font-semibold min-h-[28px]'>{players[0]?.name}</p>
            <p>Cards: {players[0]?.deck.length}</p>
          </div>
        </div>

        <p className='text-yellow-300 text-lg text-center py-2 sm:py-4 min-h-[28px]'>
          {message}
        </p>
        {/* Player Slots Side by Side */}
        <div className={styles.playerSlotsContainer}>
          {/* Bot Slot (Left) */}
          <div className={styles.playerSlot}>
            <div className={styles.cardSlot}>
              {playerSlots[1] && !snapAnimation ? (
                <Image
                  src={getCardSvgPath(playerSlots[1])}
                  alt={`${playerSlots[1].rank} of ${playerSlots[1].suit}`}
                  sizes='100vw'
                  fill
                />
              ) : !snapAnimation ? (
                <div className={styles.emptySlot}>
                  <span className={styles.emptySlotText}>Bot Slot</span>
                </div>
              ) : null}

              {/* Bot Card */}
              {animatingCard?.playerIndex === 1 &&
                animatingCard?.stage === 'flyIn' && (
                  <motion.div
                    className={`${styles.card}`}
                    initial={{
                      x: -200,
                      y: -100,
                      opacity: 0,
                      scale: 1,
                      rotate: -30,
                    }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: 'tween',
                      duration: 0.35,
                      ease: 'easeInOut',
                    }}
                    onAnimationComplete={handleAnimationEnd}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      margin: 'auto',
                    }}
                    onAnimationEnd={handleAnimationEnd}
                  >
                    <Image
                      src={getCardSvgPath(animatingCard.card)}
                      alt={`${animatingCard.card.rank} of ${animatingCard.card.suit}`}
                      sizes='100vw'
                      fill
                    />
                  </motion.div>
                )}

              {/* Snap Animation for Bot Slot */}
              {snapAnimation && playerSlots[1] && (
                <motion.div
                  className={`${styles.card}`}
                  initial={{
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: snapAnimation.winnerIndex === 1 ? -200 : 200,
                    y: -80,
                    opacity: 0,
                    scale: 1,
                    rotate: snapAnimation.winnerIndex === 1 ? -45 : 45,
                  }}
                  transition={{
                    type: 'tween',
                    duration: 0.35,
                    ease: 'easeInOut',
                  }}
                  onAnimationComplete={handleSnapAnimationEnd}
                >
                  <Image
                    src={getCardSvgPath(playerSlots[1])}
                    alt={`${playerSlots[1].rank} of ${playerSlots[1].suit}`}
                    sizes='100vw'
                    fill
                  />
                </motion.div>
              )}

              {/* Snap Badge for Bot */}
              {showSnapBadge === 1 && (
                <motion.div
                  className={`${styles.snapBadge} ${styles.snapBadgeShow}`}
                >
                  <Image
                    src='/assets/img/effects/snap.png'
                    alt='SNAP!'
                    width={60}
                    height={60}
                    className={styles.snapBadgeImage}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Player Slot (Right) */}
          <div className={styles.playerSlot}>
            <div className={styles.cardSlot}>
              {playerSlots[0] && !snapAnimation ? (
                <Image
                  src={getCardSvgPath(playerSlots[0])}
                  alt={`${playerSlots[0].rank} of ${playerSlots[0].suit}`}
                  sizes='100vw'
                  fill
                />
              ) : !snapAnimation ? (
                <div className={styles.emptySlot}>
                  <span className={styles.emptySlotText}>Your Slot</span>
                </div>
              ) : null}

              {/* Player Card */}
              {animatingCard?.playerIndex === 0 &&
                animatingCard?.stage === 'flyIn' && (
                  <motion.div
                    className={`${styles.card}`}
                    initial={{
                      x: 200,
                      y: -100,
                      opacity: 0,
                      scale: 1,
                      rotate: 30,
                    }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: 'tween',
                      duration: 0.35,
                      ease: 'easeInOut',
                    }}
                    onAnimationComplete={handleAnimationEnd}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      margin: 'auto',
                    }}
                    onAnimationEnd={handleAnimationEnd}
                  >
                    <Image
                      src={getCardSvgPath(animatingCard.card)}
                      alt={`${animatingCard.card.rank} of ${animatingCard.card.suit}`}
                      sizes='100vw'
                      fill
                    />
                  </motion.div>
                )}

              {/* Snap Animation for Player Slot */}
              {snapAnimation && playerSlots[0] && (
                <motion.div
                  className={`${styles.card}`}
                  initial={{
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: snapAnimation.winnerIndex === 0 ? 200 : -200,
                    y: -80,
                    opacity: 0,
                    scale: 1,
                    rotate: snapAnimation.winnerIndex === 0 ? 45 : -45,
                  }}
                  transition={{
                    type: 'tween',
                    duration: 0.35,
                    ease: 'easeInOut',
                  }}
                  onAnimationComplete={handleSnapAnimationEnd}
                >
                  <Image
                    src={getCardSvgPath(playerSlots[0])}
                    alt={`${playerSlots[0].rank} of ${playerSlots[0].suit}`}
                    sizes='100vw'
                    fill
                  />
                </motion.div>
              )}

              {/* Snap Badge for Player */}
              {showSnapBadge === 0 && (
                <div className={`${styles.snapBadge} ${styles.snapBadgeShow}`}>
                  <Image
                    src='/assets/img/effects/snap.png'
                    alt='SNAP!'
                    width={60}
                    height={60}
                    className={styles.snapBadgeImage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Central Pile Info (without visual slot) */}
        <div className='text-white text-center m-4 sm:m-6'>
          <h3 className=''>
            Current Pile:{' '}
            {centralPile.length + playerSlots.filter(Boolean).length} cards
          </h3>
        </div>

        {/* Game Controls */}
        <div className='flex flex-col items-center space-y-4 mb-6'>
          <div className='flex justify-center space-x-4'>
            {gameState === 'playing' && (
              <button
                onClick={playCard}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed'
                disabled={animatingCard !== null || currentPlayer === 1}
              >
                Play Card
              </button>
            )}

            <button
              onClick={() => handleSnap(0)}
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed'
              disabled={
                !playerSlots[0] ||
                !playerSlots[1] ||
                animatingCard !== null ||
                snapInProgress
              }
            >
              SNAP!
            </button>
          </div>

          <div className='flex justify-center'>
            <button
              onClick={resetGame}
              className='bg-white hover:bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold'
            >
              Reset Game
            </button>
          </div>
        </div>

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-bold text-white mb-2'>Game Over!</h2>
            <p className='text-xl text-yellow-300'>{winner} Win!</p>
          </div>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        className={`${styles.howToPlay}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-2xl font-bold mb-2'>How to Play Snap! Game</h2>
        <p className='mb-4'>
          Snap! is a fast-paced card game where players try to be the first to
          spot matching cards!
        </p>
        <ul className='list-disc ml-6 mb-4'>
          <li>
            Each player starts with a deck of 20 cards (10, J, Q, K, A in all 4
            suits).
          </li>
          <li>Players take turns playing cards to their personal slots.</li>
          <li>
            When two consecutive cards in the central pile have the same rank,
            shout "SNAP!"
          </li>
          <li>
            The first player to click SNAP wins all the cards in the central
            pile.
          </li>
          <li>The player who runs out of cards first loses the game.</li>
        </ul>
        <p className='text-sm text-gray-600'>
          Keep your eyes peeled and your reflexes sharp! Good luck!
        </p>
      </motion.div>
    </div>
  )
}
