import Link from 'next/link'
import { games } from '@/games/index'

export default function Recommendation({ currentSlug }: { currentSlug: string }) {
  const others = games.filter((g) => g.slug !== currentSlug)
  if (others.length === 0) return null
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {others.map((g) => (
          <Link key={g.slug} className="card p-3 hover:shadow-md transition" href={`/games/${g.slug}`}>
            <div className="text-2xl">{g.emoji}</div>
            <div className="font-semibold">{g.title}</div>
            <div className="text-slate-600 text-sm">{g.description}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
