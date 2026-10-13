import BlackJack from '@/games/blackjack/BlackJack'
import FlipCard from '@/games/flipcard/FlipCard'
import HighLow from '@/games/highlow/HighLow'
import Holdem from '@/games/holdem/Holdem'
import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Recommendation from '@/components/Recommendation'
import Snap from '@/games/snap/Snap'
import War from '@/games/war/War'
import { games } from '@/games/index'
import { notFound } from 'next/navigation'
import { site, withSiteUrl } from '@/lib/site'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }>  }
): Promise<Metadata> {
  const { slug } = await params
  const game = games.find(g => g.slug === slug)
  if (!game) return { title: 'Game Not Found' }

  const title = `${game.title} — Play Free Online`
  const description = `${game.description} Play it free on Card Station.`
  const url = site.url ? `${site.url}/games/${game.slug}` : undefined
  const ogImage = withSiteUrl(game.ogImage.src)

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
          width: game.ogImage.width,
          height: game.ogImage.height,
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

  const pageUrl = withSiteUrl(`/games/${game.slug}`)
  const imageUrl = withSiteUrl(game.ogImage.src)

  return (
    <div className='sm:space-y-8'>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: game.title,
          description: game.description,
          url: pageUrl,
          image: imageUrl,
          applicationCategory: 'GameApplication',
          gamePlatform: 'Web browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: withSiteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Games', item: withSiteUrl('/games') },
            { '@type': 'ListItem', position: 3, name: game.title, item: pageUrl },
          ],
        }}
      />

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
