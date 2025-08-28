import Link from 'next/link'
import type { Metadata } from 'next'
import { games } from '@/games/index'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page Not Found — Card Station',
  description:
    "The page you're looking for doesn't exist. Browse our free online card games instead.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className='space-y-8 py-12 text-center'>
      <div className='space-y-4'>
        <h1 className='text-4xl font-bold'>Page Not Found</h1>
        <p className='text-slate-600 max-w-md mx-auto'>
          The page you're looking for doesn't exist. Try one of our popular card
          games instead:
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto'>
        {games.slice(0, 6).map((game) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className='card p-4 hover:shadow-md hover:-translate-y-0.5 transition'
          >
            <div className='text-3xl mb-2'>{game.emoji}</div>
            <div className='font-bold text-lg'>{game.title}</div>
            <p className='text-slate-600 text-sm'>{game.description}</p>
          </Link>
        ))}
      </div>

      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        <Link href='/' className='btn'>
          ← Back to Home
        </Link>
        <Link href='/games' className='btn btn-secondary'>
          Browse All Games
        </Link>
      </div>
    </div>
  )
}
