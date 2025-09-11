import GameCard from '@/components/GameCard'
import Link from 'next/link'
import { games } from '@/games/index'

export default function Recommendation({
  currentSlug,
}: {
  currentSlug: string
}) {
  const others = games.filter((g) => g.slug !== currentSlug)
  if (others.length === 0) return null
  return (
    <section>
      <h2 className='text-lg font-semibold m-2 sm:mx-0 sm:m-4 text-white/90'>
        You may also like
      </h2>
      <div className='grid grid-cols-2 px-3 sm:px-0 lg:grid-cols-3 gap-3 sm:gap-6'>
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
