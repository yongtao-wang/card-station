import FlipCardGame from '@/games/flip-card/FlipCardGame'
import Link from 'next/link'
import Recommendation from '@/components/Recommendation'
import { games } from '@/games/index'
import { notFound } from 'next/navigation'

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = games.find((g) => g.slug === params.slug)
  if (!game) return notFound()

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">{game.emoji} {game.title}</h1>
          <p className="text-slate-600">{game.description}</p>
        </div>
        <Link href="/" className="btn">All Games</Link>
      </header>

      {game.slug === 'flip-card' && <FlipCardGame />}

      <Recommendation currentSlug={game.slug} />
    </div>
  )
}
