'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import styles from './flipcard.module.css'

export type Card = {
  id: number
  symbol: string
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SYMBOL_IMAGE_COUNT = 30
const SPRITES = Array.from(
  { length: SYMBOL_IMAGE_COUNT },
  (_, i) => `/img/sprites/sprite_${i + 1}.png`
)

const STORAGE_KEY = 'flip-cardie:flip-card:history'

type HistoryEntry = {
  date: string
  moves: number
  seconds: number
  boardSize: number
}

export default function FlipCard() {
  const [size, setSize] = useState(4) // 4x4 default
  const pairCount = Math.floor((size * size) / 2)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [newDeck, setNewDeck] = useState<Card[]>([])
  const [deckReady, setDeckReady] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTimeRef.current && !isFinished) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 500)
    return () => clearInterval(interval)
  }, [isFinished])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selected = shuffle(SPRITES).slice(0, pairCount)
      const deckSymbols = shuffle([...selected, ...selected])
      setNewDeck(
        deckSymbols.map((s, i) => ({
          id: i,
          symbol: s,
          flipped: false,
          matched: false,
        }))
      )
      setDeckReady(true)
    }
  }, [pairCount])

  useEffect(() => {
    if (deckReady) {
      initializeGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, newDeck, deckReady])

  function initializeGame() {
    setCards(newDeck)
    setFlippedIds([])
    setMoves(0)
    setIsFinished(false)
    startTimeRef.current = Date.now()
    setElapsed(0)
  }

  function newGame() {
    const curDeck = [...newDeck]
    const shuffledCurDeck = shuffle(curDeck)
    setCards(shuffledCurDeck)
    setFlippedIds([])
    setMoves(0)
    setIsFinished(false)
    startTimeRef.current = Date.now()
    setElapsed(0)
  }

  function onFlip(card: Card) {
    if (card.flipped || card.matched || flippedIds.length === 2 || isFinished)
      return

    const next = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    )
    const nextFlipped = [...flippedIds, card.id]
    setCards(next)
    setFlippedIds(nextFlipped)

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextFlipped.map((id) => next.find((c) => c.id === id)!)
      const isMatch = a.symbol === b.symbol
      setTimeout(() => {
        if (isMatch) {
          const matched = next.map((c) =>
            c.flipped && nextFlipped.includes(c.id)
              ? { ...c, matched: true }
              : c
          )
          setCards(matched)
        } else {
          const reverted = next.map((c) =>
            nextFlipped.includes(c.id) ? { ...c, flipped: false } : c
          )
          setCards(reverted)
        }
        setFlippedIds([])
      }, 800)
    }
  }

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setIsFinished(true)
      const seconds = Math.max(
        elapsed,
        Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000)
      )
      const entry: HistoryEntry = {
        date: new Date().toISOString(),
        moves,
        seconds,
        boardSize: size,
      }
      try {
        const prev: HistoryEntry[] = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '[]'
        )
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([entry, ...prev].slice(0, 20))
        )
      } catch {}
    }
  }, [cards, elapsed, moves, size])

  const best = useMemo(() => {
    try {
      const prev: HistoryEntry[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      )
      return prev
        .filter((h) => h.boardSize === size)
        .sort((a, b) => a.moves - b.moves || a.seconds - b.seconds)[0]
    } catch {
      return undefined
    }
  }, [size, isFinished, moves, elapsed])

  if (!deckReady) {
    return (
      <div className='flex items-center justify-center h-64 text-lg text-slate-500'>
        Loading...
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='card p-4 flex flex-wrap items-center gap-3 justify-between'>
        <div className='flex items-center gap-3'>
          <label className='text-sm text-slate-700'>Board Size</label>
          <select
            className='rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm'
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          >
            {[4, 6].map((s) => (
              <option key={s} value={s}>
                {s}x{s}
              </option>
            ))}
          </select>
          <button className='btn' onClick={newGame}>
            New Game
          </button>
        </div>
        <div className='text-sm text-slate-700 flex items-center gap-4'>
          <span>
            Moves: <span className='font-semibold'>{moves}</span>
          </span>
          <span>
            Time: <span className='font-semibold'>{elapsed}s</span>
          </span>
          {best && (
            <span className='hidden sm:inline text-emerald-700'>
              Best: {best.moves} moves / {best.seconds}s
            </span>
          )}
        </div>
      </div>

      <div
        className='grid gap-3 justify-center'
        style={{
          gridTemplateColumns: `repeat(${size}, 100px)`,
        }}
      >
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onFlip(c)}
            className={`${styles.card} ${c.flipped || c.matched ? styles.flipped : ''}`}
            aria-label={c.flipped ? `Card symbol ${c.symbol}` : 'Hidden card'}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                {/* Card back - shown when not flipped */}
              </div>
              <div className={styles.cardBack}>
                <img
                  src={c.symbol}
                  alt='Card symbol'
                  className='w-4/5 h-4/5 object-contain'
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {isFinished && (
        <div className='card p-4 border-emerald-300/40 ring-1 ring-emerald-300/30 bg-emerald-50'>
          <div className='font-bold mb-1 text-emerald-800'>
            🎉 Congratulations! You matched them all!
          </div>
          <div className='text-sm text-emerald-700'>
            You finished in {moves} moves and {elapsed} seconds.
            {best && best.moves === moves && best.seconds === elapsed && (
              <span className='block font-semibold'>This is your best score!</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
