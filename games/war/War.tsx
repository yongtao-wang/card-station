'use client'

import { Ref, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { a, i } from 'motion/react-client'

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
  id: string
  suit: Suit
  rank: Rank
  value: number
  x?: number
  y?: number
  z?: number
  isFaceUp?: boolean
  tilt?: number
}

type GameState = 'init' | 'playing' | 'war' | 'checking' | 'gameOver'

const cardBackImgUri = '/assets/img/cards/card_back.jpg'

const getCardSvgPath = (card: Card) => {
  return `/assets/img/cards/${card.rank}_of_${card.suit}.svg`
}
// Card deck creation and shuffling
const createDeck = (): Record<string, Card> => {
  const deck: Record<string, Card> = {}
  SUITS.forEach((suit) => {
    RANKS.forEach((rank, index) => {
      const card: Card = {
        id: `${suit[0]}_${rank}`,
        suit,
        rank,
        value: index + 2, // value from 2 to 14 (ace)
        x: 0,
        y: 0,
        z: index,
        tilt: 0,
        isFaceUp: false,
      }
      deck[card.id] = card
    })
  })
  return deck
}

// Shuffle card ID array
const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Get position anchor relative to board
interface Anchor {
  x: number
  y: number
}

const getAnchor = (
  ref: RefObject<HTMLElement>,
  boardRef: RefObject<HTMLElement>
) => {
  if (!ref.current || !boardRef.current) return null

  const refRect = ref.current.getBoundingClientRect()
  const boardRect = boardRef.current.getBoundingClientRect()

  return {
    x: refRect.left - boardRect.left + refRect.width / 2,
    y: refRect.top - boardRect.top + refRect.height / 2,
  }
}

const useAnchors = (
  boardRef: RefObject<HTMLElement>,
  refs: Record<string, RefObject<HTMLElement>>
) => {
  const [anchors, setAnchors] = useState<Record<string, Anchor | null>>({})

  const updateAnchors = useCallback(() => {
    const newAnchors: Record<string, Anchor | null> = {}
    for (const key in refs) {
      newAnchors[key] = getAnchor(refs[key], boardRef)
    }
    setAnchors(newAnchors)
  }, [boardRef])

  useEffect(() => {
    updateAnchors()
  }, [updateAnchors])

  useEffect(() => {
    const handleResize = () => {
      // Delay to allow DOM to update after resize
      setTimeout(updateAnchors, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateAnchors])

  return anchors
}

export default function War() {
  const [gameState, setGameState] = useState<GameState>('init')
  const [deck, setDeck] = useState<Record<string, Card>>({})
  const [message, setMessage] = useState<string>(
    'Click "Deal" to start the game!'
  )

  const [playerHandCards, setPlayerHandCards] = useState<string[]>([])
  const [botHandCards, setBotHandCards] = useState<string[]>([])
  const [playerDrawnCards, setPlayerDrawnCards] = useState<string[]>([])
  const [botDrawnCards, setBotDrawnCards] = useState<string[]>([])
  const [playerPoolCards, setPlayerPoolCards] = useState<string[]>([])
  const [botPoolCards, setBotPoolCards] = useState<string[]>([])

  const handleRoundEndLockRef = useRef<boolean>(false)
  const drawnCardTargetRef = useRef<number>(1)

  const boardRef = useRef<HTMLDivElement>(null)
  const botDeckPosRef = useRef<HTMLDivElement>(null)
  const playerDeckPosRef = useRef<HTMLDivElement>(null)
  const botDrawnCardPosRef = useRef<HTMLDivElement>(null)
  const playerDrawnCardPosRef = useRef<HTMLDivElement>(null)
  const botCardPoolPosRef = useRef<HTMLDivElement>(null)
  const playerCardPoolPosRef = useRef<HTMLDivElement>(null)

  const anchors = useAnchors(boardRef, {
    botDeckAnchor: botDeckPosRef,
    playerDeckAnchor: playerDeckPosRef,
    botCurrentCardAnchor: botDrawnCardPosRef,
    playerCurrentCardAnchor: playerDrawnCardPosRef,
    botPoolCardsAnchor: botCardPoolPosRef,
    playerPoolCardsAnchor: playerCardPoolPosRef,
  })

  const isRefsReady = (refs: RefObject<HTMLElement>[]) => {
    return refs.every((ref) => ref.current !== null)
  }

  const refsReady = isRefsReady([
    boardRef,
    botDeckPosRef,
    playerDeckPosRef,
    botDrawnCardPosRef,
    playerDrawnCardPosRef,
    botCardPoolPosRef,
    playerCardPoolPosRef,
  ])

  // Update all card positions when anchors change (e.g., window resize)
  const updateAllCardPositions = useCallback(() => {
    if (!refsReady) return

    setDeck((prevDeck) => {
      const updatedDeck = { ...prevDeck }

      // Update player hand cards positions
      playerHandCards.forEach((cardId, index) => {
        if (anchors.playerDeckAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.playerDeckAnchor.x - Math.floor(index / 5),
            y: anchors.playerDeckAnchor.y - Math.floor(index / 5),
            z: index + 10,
          }
        }
      })

      // Update bot hand cards positions
      botHandCards.forEach((cardId, index) => {
        if (anchors.botDeckAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.botDeckAnchor.x - Math.floor(index / 5),
            y: anchors.botDeckAnchor.y - Math.floor(index / 5),
            z: index + 10,
          }
        }
      })

      // Update drawn cards positions
      playerDrawnCards.forEach((cardId, index) => {
        if (anchors.playerCurrentCardAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.playerCurrentCardAnchor.x,
            y: anchors.playerCurrentCardAnchor.y,
            z: index + 999,
          }
        }
      })

      botDrawnCards.forEach((cardId, index) => {
        if (anchors.botCurrentCardAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.botCurrentCardAnchor.x,
            y: anchors.botCurrentCardAnchor.y,
            z: index + 999,
          }
        }
      })

      // Update pool cards positions
      playerPoolCards.forEach((cardId, index) => {
        if (anchors.playerPoolCardsAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.playerPoolCardsAnchor.x,
            y: anchors.playerPoolCardsAnchor.y,
            z: index + 1,
          }
        }
      })

      botPoolCards.forEach((cardId, index) => {
        if (anchors.botPoolCardsAnchor) {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: anchors.botPoolCardsAnchor.x,
            y: anchors.botPoolCardsAnchor.y,
            z: index + 1,
          }
        }
      })

      return updatedDeck
    })
  }, [
    anchors,
    refsReady,
    playerHandCards,
    botHandCards,
    playerDrawnCards,
    botDrawnCards,
    playerPoolCards,
    botPoolCards,
  ])

  // Trigger card position update when anchors change
  useEffect(() => {
    updateAllCardPositions()
  }, [anchors, updateAllCardPositions])

  const init = () => {
    setDeck(initDeckPositions(createDeck()))
    setPlayerDrawnCards([])
    setBotDrawnCards([])
    setPlayerPoolCards([])
    setBotPoolCards([])
    handleRoundEndLockRef.current = false
    drawnCardTargetRef.current = 1
    setGameState('playing')
    setMessage('Game started! Click on your top card to draw.')
  }

  const initDeckPositions = (deck: Record<string, Card>) => {
    const shuffledIds = shuffle(Object.keys(deck))
    const playerBaseX = anchors.playerDeckAnchor?.x || 100
    const playerBaseY = anchors.playerDeckAnchor?.y || 100
    const botBaseX = anchors.botDeckAnchor?.x || 100
    const botBaseY = anchors.botDeckAnchor?.y || 100

    shuffledIds.forEach((cardId, index) => {
      const card = deck[cardId]
      card.isFaceUp = false
      // Simulate interleaving dealing of cards
      if (index % 2 === 0) {
        card.x = playerBaseX - Math.floor(index / 5)
        card.y = playerBaseY - Math.floor(index / 5)
        card.z = (index + 1) * 10
        setPlayerHandCards((prev) => [...prev, card.id])
      } else {
        card.x = botBaseX - Math.floor(index / 5)
        card.y = botBaseY - Math.floor(index / 5)
        card.z = (index + 1) * 10
        setBotHandCards((prev) => [...prev, card.id])
      }
    })
    return deck
  }

  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'war') return

    if (playerHandCards.length === 0)
      setTimeout(() => {
        resetPoolCardsToDeck(anchors.playerDeckAnchor)
      }, 300)
    if (botHandCards.length === 0)
      setTimeout(() => {
        resetPoolCardsToDeck(anchors.botDeckAnchor)
      }, 300)

    // draw computer card in 'playing' and 'war' state
    if (
      ((gameState === 'playing' && botDrawnCards.length < 1) ||
        (gameState === 'war' &&
          botDrawnCards.length < drawnCardTargetRef.current)) &&
      !handleRoundEndLockRef.current
    ) {
      // add random delay to simulate thinking time
      const timeout = Math.random() * (1000 - 200) + 200
      setTimeout(() => {
        let cardFaceUp = true
        if (
          gameState === 'war' &&
          botDrawnCards.length < drawnCardTargetRef.current - 1
        )
          cardFaceUp = false
        moveCard(botHandCards.at(-1)!, anchors.botCurrentCardAnchor, cardFaceUp)
      }, timeout)
      return
    }

    if (
      ((gameState === 'war' &&
        playerDrawnCards.length >= drawnCardTargetRef.current &&
        botDrawnCards.length >= drawnCardTargetRef.current) ||
        (gameState === 'playing' &&
          playerDrawnCards.length === 1 &&
          botDrawnCards.length === 1)) &&
      !handleRoundEndLockRef.current
    ) {
      HandleRoundEnd()
    }
  }, [playerHandCards, botHandCards, gameState])

  const allowToDraw = (
    gameState: GameState,
    drawnCount: number,
    drawnCardTarget: number
  ): boolean => {
    // Only allow drawing in 'playing' or 'war' state
    if (gameState !== 'playing' && gameState !== 'war') return false

    // Normal round: can only draw 1 card
    if (gameState === 'playing' && drawnCount >= 1) return false

    // War round: can only draw up to the target amount
    if (gameState === 'war' && drawnCount >= drawnCardTarget) return false

    return true
  }

  const HandleRoundEnd = () => {
    if (playerDrawnCards.length === 0 || botDrawnCards.length === 0) return
    if (handleRoundEndLockRef.current) return // Prevent double comparison
    handleRoundEndLockRef.current = true
    // Compare cards
    const curBotCard = deck[botDrawnCards.at(-1)!]
    const curPlayerCard = deck[playerDrawnCards.at(-1)!]
    let roundWinner: 'player' | 'bot' | null = null

    if (curPlayerCard.value > curBotCard.value) {
      setMessage('You win this round!')
      roundWinner = 'player'
    } else if (curBotCard.value > curPlayerCard.value) {
      setMessage('Computer wins this round!')
      roundWinner = 'bot'
    } else {
      if (gameState === 'playing') {
        setMessage('War! Cards are equal!')
      } else {
        setMessage('War continues! Cards are equal again!')
      }
    }

    // Clear current cards after comparison
    setTimeout(() => {
      if (roundWinner === null) {
        setGameState('war')
        drawnCardTargetRef.current += 4
        handleRoundEndLockRef.current = false
        return
      }

      if (roundWinner === 'player')
        moveAllDrawnCardsToPool(anchors.playerPoolCardsAnchor)
      if (roundWinner === 'bot')
        moveAllDrawnCardsToPool(anchors.botPoolCardsAnchor)
      setGameState('playing')
      checkGameWinner()
    }, 1500)

    setTimeout(() => {
      handleRoundEndLockRef.current = false
    }, 600)
  }

  const moveCard = (
    cardId: string,
    destAnchor: Anchor | null,
    isFaceUp: boolean | null
  ) => {
    // Concurrency should be handled outside of this function
    if (!destAnchor) return

    if (destAnchor === anchors.botCurrentCardAnchor) {
      setDeck((prevDeck) => {
        return {
          ...prevDeck,
          [cardId]: {
            ...prevDeck[cardId],
            x: destAnchor.x,
            y: destAnchor.y,
            z: botDrawnCards.length + 999,
            isFaceUp: isFaceUp || prevDeck[cardId].isFaceUp || false,
          },
        }
      })
      // Notice: there is no empty array check. It should be handled before calling this function
      setBotDrawnCards((prev) => [...prev, botHandCards.at(-1)!])
      setBotHandCards((prev) => prev.slice(0, prev.length - 1))
    } else if (destAnchor === anchors.playerCurrentCardAnchor) {
      setDeck((prevDeck) => {
        return {
          ...prevDeck,
          [cardId]: {
            ...prevDeck[cardId],
            x: destAnchor.x,
            y: destAnchor.y,
            z: playerDrawnCards.length + 999,
            isFaceUp: isFaceUp || prevDeck[cardId].isFaceUp || false,
          },
        }
      })
      // Notice: there is no empty array check. It should be handled before calling this function
      setPlayerDrawnCards((prev) => [...prev, playerHandCards.at(-1)!])
      setPlayerHandCards((prev) => prev.slice(0, prev.length - 1))
    }
  }

  const moveAllDrawnCardsToPool = (destAnchor: Anchor | null) => {
    if (!destAnchor) return

    if (destAnchor === anchors.botPoolCardsAnchor) {
      const cardIds = [...botDrawnCards, ...playerDrawnCards]
      setDeck((prevDeck) => {
        const updatedDeck = { ...prevDeck }
        cardIds.forEach((cardId, index) => {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: destAnchor.x,
            y: destAnchor.y,
            z: botPoolCards.length + index + 1,
            tilt: (Math.random() - 0.5) * 20,
          }
        })
        return updatedDeck
      })
      setBotPoolCards((prev) => [
        ...prev,
        ...botDrawnCards,
        ...playerDrawnCards,
      ])
      setBotDrawnCards([])
      setPlayerDrawnCards([])
      drawnCardTargetRef.current = 1
      return
    }
    if (destAnchor === anchors.playerPoolCardsAnchor) {
      const cardIds = [...botDrawnCards, ...playerDrawnCards]
      setDeck((prevDeck) => {
        const updatedDeck = { ...prevDeck }
        cardIds.forEach((cardId, index) => {
          updatedDeck[cardId] = {
            ...updatedDeck[cardId],
            x: destAnchor.x,
            y: destAnchor.y,
            z: playerPoolCards.length + index + 1,
            tilt: (Math.random() - 0.5) * 20,
          }
        })
        return updatedDeck
      })
      setPlayerPoolCards((prev) => [
        ...prev,
        ...botDrawnCards,
        ...playerDrawnCards,
      ])
      setBotDrawnCards([])
      setPlayerDrawnCards([])
      drawnCardTargetRef.current = 1
      return
    }
  }

  const resetPoolCardsToDeck = (anchor: Anchor | null) => {
    if (!anchor) return
    if (checkGameWinner()) return
    if (anchor === anchors.playerDeckAnchor) {
      const resetCardIds = shuffle([...playerHandCards, ...playerPoolCards])
      resetCardIds.forEach((cardId, index) => {
        setDeck((prevDeck) => {
          return {
            ...prevDeck,
            [cardId]: {
              ...prevDeck[cardId],
              x: (anchors.playerDeckAnchor?.x || 100) - Math.floor(index / 5),
              y: (anchors.playerDeckAnchor?.y || 100) - Math.floor(index / 5),
              z: (index + 1) * 10,
              tilt: 0,
              isFaceUp: false,
            },
          }
        })
      })
      setPlayerHandCards((prev) => resetCardIds)
      setPlayerPoolCards([])
    } else if (anchor === anchors.botDeckAnchor) {
      const resetCardIds = shuffle([...botHandCards, ...botPoolCards])
      resetCardIds.forEach((cardId, index) => {
        setDeck((prevDeck) => {
          return {
            ...prevDeck,
            [cardId]: {
              ...prevDeck[cardId],
              x: (anchors.botDeckAnchor?.x || 100) - Math.floor(index / 5),
              y: (anchors.botDeckAnchor?.y || 100) - Math.floor(index / 5),
              z: (index + 1) * 10,
              tilt: 0,
              isFaceUp: false,
            },
          }
        })
      })
      setBotHandCards((prev) => resetCardIds)
      setBotPoolCards([])
    }
  }

  const handlePlayerDeckClick = (cardId: string) => {
    if (gameState !== 'playing' && gameState !== 'war') return
    if (
      !allowToDraw(
        gameState,
        playerDrawnCards.length,
        drawnCardTargetRef.current
      )
    )
      return

    // Disable click if card is not on top of hand
    if (playerHandCards.at(-1) !== cardId) return
    let cardFaceUp = true
    if (
      gameState === 'war' &&
      playerDrawnCards.length < drawnCardTargetRef.current - 1
    )
      cardFaceUp = false // face down for first 3 war cards
    moveCard(cardId, anchors.playerCurrentCardAnchor, cardFaceUp)
  }

  const checkGameWinner = () => {
    if (playerHandCards.length === 0 && playerPoolCards.length === 0) {
      setGameState('gameOver')
      setMessage('You have no more cards! You lost the game.')
      return true
    }
    if (botHandCards.length === 0 && botPoolCards.length === 0) {
      setGameState('gameOver')
      setMessage('Computer has no more cards! You won the game!')
      return true
    }
    return false
  }

  return (
    <div className={`${styles.game} sm:p-4`}>
      <motion.div
        ref={boardRef}
        className={`relative ${styles.board} ${
          gameState === 'war' ? 'bg-red-900' : 'bg-green-900'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {Object.values(deck).map((card, index) => (
          <motion.div
            key={index}
            className={styles.card}
            style={{
              position: 'absolute',
              left: `${card.x}px`,
              top: `${card.y}px`,
              zIndex: card.z,
              boxShadow: 'none',
              transformOrigin: 'center center',
            }}
            initial={{
              x: '-50%',
              y: '-50%',
              left: `${card.x}px`,
              top: `${card.y}px`,
              zIndex: card.z,
              rotate: card.tilt ?? 0,
            }}
            animate={{
              x: '-50%',
              y: '-50%',
              left: `${card.x}px`,
              top: `${card.y}px`,
              zIndex: card.z,
              rotate: card.tilt ?? 0,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={() => handlePlayerDeckClick(card.id)}
          >
            {card.isFaceUp ? (
              <Image
                src={getCardSvgPath(card)}
                alt={`${card.rank} of ${card.suit}`}
                sizes='100vw'
                fill
                className={styles.card}
              />
            ) : (
              <Image
                src={cardBackImgUri}
                alt='Card back'
                sizes='100vw'
                fill
                className={styles.card}
              />
            )}
          </motion.div>
        ))}
        <h1 className='text-2xl sm:text-3xl font-bold text-white text-center p-4 pb-8 sm:p-8 sm:pb-16'>
          War
        </h1>
        <div className='w-[60%] mx-auto my-2 sm:my-8 flex flex-col items-center justify-center gap-20'>
          <div className='grid grid-cols-3 gap-12 justify-items-center items-center'>
            <div></div>
            {/* Bot deck anchor */}
            <div ref={botDeckPosRef} className={styles.emptyCardSlot} />
            {/* Bot won cards anchor */}
            <div ref={botCardPoolPosRef} className={styles.emptyCardSlot} />
          </div>
          <div className='flex flex-row justify-center w-1/2'>
            <div className={styles.slotsContainer}>
              {/* Current bot cards anchor */}
              <div ref={botDrawnCardPosRef} className={styles.DrawSlot}>
                <span className={styles.emptySlotText}>Bot Card</span>
              </div>
              {/* Current player cards anchor */}
              <div ref={playerDrawnCardPosRef} className={styles.DrawSlot}>
                <span className={styles.emptySlotText}>Player Card</span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-12 justify-items-center'>
            {/* Player won cards anchor */}
            <div ref={playerCardPoolPosRef} className={styles.emptyCardSlot} />
            {/* Player deck anchor */}
            <div ref={playerDeckPosRef} className={styles.emptyCardSlot} />
          </div>
          <div></div>
        </div>
        <div className='text-center mb-4'>
          {gameState === 'init' && (
            <motion.button
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                !refsReady ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={init}
              whileTap={{ scale: 0.95 }}
              disabled={!refsReady}
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
