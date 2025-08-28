import BlackJack from '@/games/blackjack/BlackJack'
import FlipCard from '@/games/flip-card/FlipCard'
import HighLow from '@/games/highlow/HighLow'
import Holdem from '@/games/holdem/Holdem'
import Link from 'next/link'
import type { Metadata } from 'next'
import Recommendation from '@/components/Recommendation'
import Snap from '@/games/snap/Snap'
import War from '@/games/war/War'
import { games } from '@/games/index'
import { notFound } from 'next/navigation'
import { site } from '@/lib/site'

type PageParams = Promise<{ slug: string }>

export async function generateMetadata(
  { params }: { params: PageParams }
): Promise<Metadata> {
  const { slug } = await params
  const game = games.find(g => g.slug === slug)
  if (!game) return { title: 'Game Not Found' }
  const title = `${game.title} — Play Free Online`
  const description = game.description + ' Play it free on Card Station.'
  const url = site.url ? `${site.url}/games/${game.slug}` : undefined
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url
    },
    twitter: { title, description }
  }
}

export default async function GamePage({ params }: { params: PageParams }) {
  const { slug } = await params
  const game = games.find((g) => g.slug === slug)
  if (!game) return notFound()

  return (
    <div className='space-y-8'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            {game.emoji} {game.title}
          </h1>
          <p className='text-slate-400'>{game.description}</p>
        </div>
        <Link href='/' className='btn'>
          All Games
        </Link>
      </header>

      {game.slug === 'flip-card' && <FlipCard />}
      {game.slug === 'holdem' && <Holdem />}
      {game.slug === 'war' && <War />}
      {game.slug === 'blackjack' && <BlackJack />}
      {game.slug === 'highlow' && <HighLow />}
      {game.slug === 'snap' && <Snap />}

      <Recommendation currentSlug={game.slug} />
    </div>
  )
}
