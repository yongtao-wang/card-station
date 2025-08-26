import GameCard from '@/components/GameCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { games } from '@/games/index'

export const metadata: Metadata = {
  title: 'Play Free Online Card Games (Blackjack, Hold\'em, Memory) — Card Station',
  description: 'Instant, free & fun mini card games: Blackjack, Texas Hold\'em vs Bot, Flip Card memory game, High Low & Snap. Mobile-friendly & no signup required.'
}

export default function HomePage() {
  return (
    <div className='space-y-6'>
      <section>
        <h1 className='text-3xl font-extrabold tracking-tight drop-shadow-sm'>
          Card Station
        </h1>
        <p className='text-slate-600'>Pick a mini game and start flipping!</p>
      </section>
      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {games.map((g) => (
          <Link key={g.slug} href={`/games/${g.slug}`}>
            <GameCard
              title={g.title}
              description={g.description}
              emoji={g.emoji}
            />
          </Link>
        ))}
      </section>
    </div>
  )
}
