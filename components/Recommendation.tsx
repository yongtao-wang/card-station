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
      <div className='recommendation'>
        {others.map((g) => (
            <GameCard
              key={g.slug}
              title={g.title}
              description={g.description}
              slug={g.slug}
            />
        ))}
      </div>
    </section>
  )
}
