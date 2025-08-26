import './globals.css'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { games, type GameMeta } from '@/games/index'

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: {
    default: 'Card Station — Free Online Card Games',
    template: '%s | Card Station'
  },
  description: 'Play free online card & memory mini games (Blackjack, Texas Hold\'em vs Bot, Flip Card, High Low, Snap & more). Fast, mobile-friendly & no signup.',
  keywords: ['card games', 'online card games', 'free card games', 'blackjack', 'texas hold\'em', 'memory game', 'flip card', 'high low', 'snap card game'],
  authors: [{ name: 'Card Station' }],
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'Card Station — Free Online Card Games',
    description: 'Play Blackjack, Texas Hold\'em (bot), memory flip, High / Low, Snap and more — instant & free.',
    url: site.url || undefined,
    siteName: 'Card Station',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Card Station — Free Online Card Games',
    description: 'Quick, fun & free mini card games you can play instantly.'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-teal-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
        <Footer />
        {/* Global structured data for the site & games */}
        <script
          type="application/ld+json"
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
                'query-input': 'required name=search_term_string'
              },
              hasPart: (games as GameMeta[]).map((g) => ({
                '@type': 'Game',
                name: g.title,
                url: site.url ? `${site.url}/games/${g.slug}` : `/games/${g.slug}`,
                description: g.description
              }))
            })
          }}
        />
      </body>
    </html>
  )
}
