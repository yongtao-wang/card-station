import Image from 'next/image'
import Link from 'next/link'
import { games } from '@/games/index'

type Props = {
  title: string
  description: string
  slug?: string
}

export default function GameCard({ title, description, slug }: Props) {
  const ogImage = games.find((game) => game.slug === slug)?.ogImage
  const src = ogImage?.src ?? games[0].ogImage.src

  return (
    <div className=''>
      <div className='rounded-lg bg-white/5 backdrop-blur ring-1 ring-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black transition h-full aspect-[5/3]'>
        {/* OG Image */}
        <Link key={slug} href={`/games/${slug}`}>
          <div className='relative w-full h-full'>
            <Image
              src={src}
              alt={`${title} card game`}
              fill
              className='object-cover rounded-lg'
              sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
            />
          </div>
        </Link>
      </div>
      {/* Game Name */}
      <div className='text-center py-4'>
        <h3 className='font-semibold text-white/90 text-base sm:text-xl mb-1'>
          {title}
        </h3>
        <p
          className='text-xs text-white/70 overflow-hidden'
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
