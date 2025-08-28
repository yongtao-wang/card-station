import GameCard from '@/components/GameCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { games } from '@/games/index'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'All Card Games — Free Online Card & Memory Games',
  description: 'Browse all free online card games: Blackjack, Texas Hold\'em vs Bot, Flip Card memory game, High Low, Snap & War. Instant play, no signup required.',
  alternates: { canonical: site.url ? `${site.url}/games` : undefined },
  openGraph: {
    title: 'All Card Games — Free Online Card & Memory Games',
    description: 'Browse all free online card games: Blackjack, Texas Hold\'em vs Bot, Flip Card memory game, High Low, Snap & War. Instant play, no signup required.',
    type: 'website',
    url: site.url ? `${site.url}/games` : undefined
  }
}

export default function GamesPage() {
  return (
    <div className='space-y-8'>
      <header className='text-center space-y-4'>
        <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
          All Card Games
        </h1>
        <p className='text-slate-600 max-w-2xl mx-auto'>
          Choose from our collection of free online card and memory games. All games are instant play, 
          mobile-friendly, and require no signup or downloads.
        </p>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {games.map((game) => (
          <Link key={game.slug} href={`/games/${game.slug}`}>
            <GameCard
              title={game.title}
              description={game.description}
              emoji={game.emoji}
            />
          </Link>
        ))}
      </section>

      <section className='bg-slate-50 rounded-2xl p-6 md:p-8 space-y-4'>
        <h2 className='text-xl font-bold'>Why Play Card Games Online?</h2>
        <div className='grid md:grid-cols-2 gap-6 text-sm text-slate-700'>
          <div>
            <h3 className='font-semibold mb-2'>🎯 Skill Development</h3>
            <p>Improve your strategic thinking with games like Blackjack and Texas Hold'em. Practice probability, memory, and decision-making skills.</p>
          </div>
          <div>
            <h3 className='font-semibold mb-2'>🧠 Memory Training</h3>
            <p>Flip Card and memory-based games help enhance cognitive function and concentration through engaging gameplay.</p>
          </div>
          <div>
            <h3 className='font-semibold mb-2'>⚡ Instant Entertainment</h3>
            <p>No downloads, no signup required. Jump into any game immediately and play as long or as little as you want.</p>
          </div>
          <div>
            <h3 className='font-semibold mb-2'>📱 Play Anywhere</h3>
            <p>All games are optimized for mobile devices. Play on your phone, tablet, or desktop with the same great experience.</p>
          </div>
        </div>
      </section>

      <section className='text-center space-y-4'>
        <h2 className='text-xl font-bold'>Game Types</h2>
        <div className='flex flex-wrap justify-center gap-3'>
          <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>Strategy Games</span>
          <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium'>Memory Games</span>
          <span className='px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium'>Card Games</span>
          <span className='px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'>Reaction Games</span>
        </div>
        <p className='text-slate-600 text-sm max-w-lg mx-auto'>
          Each game offers a unique challenge and entertainment value. From quick reflex games to deep strategy, 
          there's something for every type of player.
        </p>
      </section>
    </div>
  )
}
