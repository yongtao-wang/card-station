import Link from 'next/link'
import { games } from '@/games/index'

export default function Footer() {
  return (
    <footer className='w-full bg-transparent mt-auto relative z-10 pb-[env(safe-area-inset-bottom)]'>
      <div className='max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-300'>
        <nav aria-label='Games' className='flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3'>
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className='hover:text-white'
            >
              {game.title}
            </Link>
          ))}
        </nav>
        <p>© 2025 Card Station · Free card games for fun & learning</p>
      </div>
    </footer>
  )
}
