import BlackJack from '@/games/blackjack/BlackJack'
import FlipCardGame from '@/games/flip-card/FlipCardGame'
import HighLow from '@/games/highlow/HighLow'
import Holdem from '@/games/holdem/Holdem'
import Link from 'next/link'
import Recommendation from '@/components/Recommendation'
import Snap from '@/games/snap/Snap'
import War from '@/games/war/War'
import { games } from '@/games/index'
import { notFound } from 'next/navigation'

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
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
          <p className='text-slate-600'>{game.description}</p>
        </div>
        <Link href='/' className='btn'>
          All Games
        </Link>
      </header>

      {game.slug === 'flip-card' && <FlipCardGame />}
      {game.slug === 'holdem' && <Holdem />}
      {game.slug === 'war' && <War />}
      {game.slug === 'blackjack' && <BlackJack />}
      {game.slug === 'highlow' && <HighLow />}
      {game.slug === 'snap' && <Snap />}

      <Recommendation currentSlug={game.slug} />
    </div>
  )
}
