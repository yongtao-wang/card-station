import BlackJack from '@/games/blackjack/BlackJack'
import FlipCard from '@/games/flipcard/FlipCard'
import HighLow from '@/games/highlow/HighLow'
import Holdem from '@/games/holdem/Holdem'
import Link from 'next/link'
import type { Metadata } from 'next'
import Recommendation from '@/components/Recommendation'
import Script from 'next/script'
import Snap from '@/games/snap/Snap'
import War from '@/games/war/War'
import { games } from '@/games/index'
import { notFound } from 'next/navigation'
import { site } from '@/lib/site'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }>  }
): Promise<Metadata> {
  const { slug } = await params
  const game = games.find(g => g.slug === slug)
  if (!game) return { title: 'Game Not Found' }

  const title = `${game.title} — Play Free Online`
  const description = `${game.description} Play it free on Card Station.`
  const url = site.url ? `${site.url}/games/${game.slug}` : undefined
  
  // Fetch OG image based on game slug
  const getOgImage = (gameSlug: string) => {
    const ogImages: Record<string, string> = {
      'holdem': '/assets/img/og/holdem_og.webp',
      'blackjack': '/assets/img/og/blackjack_og.webp',
      'flipcard': '/assets/img/og/flipcard_og.webp',
      'war': '/assets/img/og/war_og.webp',
      'highlow': '/assets/img/og/highlow_og.webp',
      'snap': '/assets/img/og/snap_og.webp',
      // Add more mappings as more games are added
    }
    return ogImages[gameSlug] || '/assets/img/og/holdem_og.webp' // default to holdem image
  }

  const ogImage = site.url ? `${site.url}${getOgImage(slug)}` : getOgImage(slug)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'Card Station',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${game.title} - Play Free Online Card Game`
        }
      ],
    },
    twitter: { 
      title, 
      description, 
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }>  }) {
  const { slug } = await params
  const game = games.find((g) => g.slug === slug)
  if (!game) return notFound()

  const getOgImage = (gameSlug: string) => {
    const ogImages: Record<string, string> = {
      'holdem': '/assets/img/og/holdem_og.webp',
    }
    return ogImages[gameSlug] || '/assets/img/og/holdem_og.webp'
  }

  const ogImageUrl = site.url ? `${site.url}${getOgImage(slug)}` : getOgImage(slug)

  return (
    <div className='sm:space-y-8'>
      <Script id="game-jsonld" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Game',
          'name': game.title,
          'description': game.description,
          'url': `${site.url ? site.url : ''}/games/${game.slug}`,
          'image': ogImageUrl
        })}
      </Script>

      <header className='hidden sm:flex items-center justify-between p-4 sm:px-0'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            {game.emoji} {game.title}
          </h1>
          <p className='text-slate-400'>{game.description}</p>
        </div>
        <Link 
          href='/' 
          className='inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur text-white font-semibold shadow ring-1 ring-white/20 hover:bg-white/20 hover:ring-white/30 active:translate-y-px transition text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2'
        >
          All Games
        </Link>
      </header>

      {game.slug === 'flipcard' && <FlipCard />}
      {game.slug === 'holdem' && <Holdem />}
      {game.slug === 'war' && <War />}
      {game.slug === 'blackjack' && <BlackJack />}
      {game.slug === 'highlow' && <HighLow />}
      {game.slug === 'snap' && <Snap />}

      <Recommendation currentSlug={game.slug} />
    </div>
  )
}
