import './globals.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { games, type GameMeta } from '@/games/index'

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: {
    default: 'Card Station — Free Online Card Games',
    template: '%s | Card Station',
  },
  description:
    "Play free online card & memory mini games (Blackjack, Texas Hold'em vs Bot, Flip Card, High Low, Snap & more). Fast, mobile-friendly & no signup.",
  keywords: [
    'card games',
    'online card games',
    'free card games',
    'blackjack',
    "texas hold'em",
    'memory game',
    'flip card',
    'high low',
    'snap card game',
  ],
  authors: [{ name: 'Card Station' }],
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'Card Station — Free Online Card Games',
    description:
      "Play Blackjack, Texas Hold'em (bot), memory flip, High / Low, Snap and more — instant & free.",
    url: site.url || undefined,
    siteName: 'Card Station',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Card Station — Free Online Card Games',
    description: 'Quick, fun & free mini card games you can play instantly.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gradient-to-br from-[#19162e] via-[#1f1b3f] to-[#0d0b1c] text-slate-100 flex flex-col relative overflow-x-hidden'>
        {/* ambient neon background */}
        <div aria-hidden className='pointer-events-none fixed inset-0 -z-10'>
          <div className='absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl' />
          <div className='absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl' />
        </div>
        {/* Skip to content for keyboard users */}
        <a href='#main' className='sr-only focus:not-sr-only focus:absolute focus:m-4 focus:rounded focus:bg-black/60 focus:text-white focus:px-3 focus:py-1 focus:shadow focus:outline-none'>Skip to content</a>
        <Header />
        <div aria-hidden className='h-4'></div>
        <main id='main' className='flex-1 w-full max-w-6xl mx-auto px-4'>
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        {/* Global structured data for the site & games */}
        <script
          type='application/ld+json'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Card Station',
              url: site.url || undefined,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${site.url || ''}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
              hasPart: (games as GameMeta[]).map((g) => ({
                '@type': 'Game',
                name: g.title,
                url: site.url
                  ? `${site.url}/games/${g.slug}`
                  : `/games/${g.slug}`,
                description: g.description,
              })),
            }),
          }}
        />
      </body>
    </html>
  )
}
