import Link from 'next/link'
import GameCard from '@/components/GameCard'
import { games } from '@/games/index'

export default function Recommendation({ currentSlug }: { currentSlug: string }) {
  const others = games.filter((g) => g.slug !== currentSlug)
  if (others.length === 0) return null
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-white/90">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {others.map((g) => (
          <Link key={g.slug} href={`/games/${g.slug}`}>
            <GameCard
              title={g.title}
              description={g.description}
              emoji={g.emoji}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
