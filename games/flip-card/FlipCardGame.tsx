"use client"

import { useEffect, useMemo, useRef, useState } from 'react'

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

const SYMBOLS = ['🍎','🍌','🍇','🍉','🍓','🍒','🍍','🥝','🥕','🍆','🌶️','🥑']

const STORAGE_KEY = 'flip-cardie:flip-card:history'

type HistoryEntry = {
  date: string
  moves: number
  seconds: number
  boardSize: number
}

export default function FlipCardGame() {
  const [size, setSize] = useState(4) // 4x4 default
  const pairCount = Math.floor((size * size) / 2)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTimeRef.current && !isFinished) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 500)
    return () => clearInterval(interval)
  }, [isFinished])

  const newDeck = useMemo(() => {
    const selected = shuffle(SYMBOLS).slice(0, pairCount)
    const deckSymbols = shuffle([...selected, ...selected])
    return deckSymbols.map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }))
  }, [pairCount])

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  function reset() {
    setCards(newDeck)
    setFlippedIds([])
    setMoves(0)
    setIsFinished(false)
    startTimeRef.current = Date.now()
    setElapsed(0)
  }

  function onFlip(card: Card) {
    if (card.flipped || card.matched || flippedIds.length === 2 || isFinished) return

    const next = cards.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    const nextFlipped = [...flippedIds, card.id]
    setCards(next)
    setFlippedIds(nextFlipped)

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextFlipped.map((id) => next.find((c) => c.id === id)!)
      const isMatch = a.symbol === b.symbol
      setTimeout(() => {
        if (isMatch) {
          const matched = next.map((c) => (c.flipped && nextFlipped.includes(c.id) ? { ...c, matched: true } : c))
          setCards(matched)
        } else {
          const reverted = next.map((c) => (nextFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          setCards(reverted)
        }
        setFlippedIds([])
      }, 600)
    }
  }

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setIsFinished(true)
      const seconds = Math.max(elapsed, Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000))
      const entry: HistoryEntry = { date: new Date().toISOString(), moves, seconds, boardSize: size }
      try {
        const prev: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...prev].slice(0, 20)))
      } catch {}
    }
  }, [cards, elapsed, moves, size])

  const best = useMemo(() => {
    try {
      const prev: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return prev
        .filter((h) => h.boardSize === size)
        .sort((a, b) => a.moves - b.moves || a.seconds - b.seconds)[0]
    } catch {
      return undefined
    }
  }, [size])

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-700">Board</label>
          <select
            className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          >
            {[4, 6].map((s) => (
              <option key={s} value={s}>{s}x{s}</option>
            ))}
          </select>
          <button className="btn" onClick={reset}>New Game</button>
        </div>
        <div className="text-sm text-slate-700 flex items-center gap-4">
          <span>Moves: <span className="font-semibold">{moves}</span></span>
          <span>Time: <span className="font-semibold">{elapsed}s</span></span>
          {best && (
            <span className="hidden sm:inline text-emerald-700">Best: {best.moves} moves / {best.seconds}s</span>
          )}
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onFlip(c)}
            className={`aspect-square rounded-xl shadow-sm border border-black/5 relative overflow-hidden transition-transform active:translate-y-px ${
              c.matched ? 'bg-emerald-100' : c.flipped ? 'bg-white' : 'bg-teal-200'
            }`}
            aria-label={c.flipped ? c.symbol : 'Hidden card'}
          >
            <div className={`absolute inset-0 flex items-center justify-center text-3xl transition-opacity ${
              c.flipped || c.matched ? 'opacity-100' : 'opacity-0'
            }`}>{c.symbol}</div>
            <div className={`absolute inset-0 bg-teal-400 ${
              c.flipped || c.matched ? 'opacity-0' : 'opacity-100'
            } transition-opacity`} />
          </button>
        ))}
      </div>

      {isFinished && (
        <div className="card p-4 border-emerald-300/40 ring-1 ring-emerald-300/30 bg-emerald-50">
          <div className="font-bold mb-1">Nice! You matched them all 🎉</div>
          <div className="text-sm text-slate-700">You finished in {moves} moves and {elapsed}s.</div>
        </div>
      )}
    </div>
  )
}
