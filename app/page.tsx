import GameCard from '@/components/GameCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { games } from '@/games/index'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title:
    "Play Free Online Card Games (Blackjack, Hold'em, Memory) — Card Station",
  description:
    "Instant, free & fun mini card games: Blackjack, Texas Hold'em vs Bot, Flip Card memory game, High Low & Snap. Mobile-friendly & no signup required.",
  alternates: { canonical: site.url ? `${site.url}/` : undefined },
  openGraph: {
    title:
      "Play Free Online Card Games (Blackjack, Hold'em, Memory) — Card Station",
    description:
      "Instant, free & fun mini card games: Blackjack, Texas Hold'em vs Bot, Flip Card memory game, High Low & Snap. Mobile-friendly & no signup required.",
    url: site.url ? `${site.url}/` : undefined,
    siteName: 'Card Station',
    type: 'website',
    images: [
      {
        url: site.url
          ? `${site.url}/assets/img/og/holdem_og.webp`
          : '/assets/img/og/holdem_og.webp',
        width: 500,
        height: 300,
        alt: 'Card Station - Play Texas Hold\'em Free Online',
      },
      {
        url: site.url
          ? `${site.url}/assets/img/og/blackjack_og.webp`
          : '/assets/img/og/blackjack_og.webp',
        width: 500,
        height: 300,
        alt: "Card Station - Play Blackjack Free Online",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      "Play Free Online Card Games (Blackjack, Hold'em, Memory) — Card Station",
    description:
      "Instant, free & fun mini card games: Blackjack, Texas Hold'em vs Bot, Flip Card memory game, High Low & Snap. Mobile-friendly & no signup required.",
    images: [
      site.url
        ? `${site.url}/assets/img/og/holdem_og.webp`
        : '/assets/img/og/holdem_og.webp',
    ],
  },
}

export default function HomePage() {
  return (
    <div className='space-y-8 sm:py-12'>
      <section className='relative overflow-hidden sm:rounded-2xl bg-gradient-to-br from-[#19162e] via-[#1f1b3f] to-[#0d0b1c] text-white ring-1 ring-white/10 shadow-xl p-6 md:p-10 max-w-[64rem] mx-auto'>
        {/* ambient glow */}
        <div aria-hidden className='pointer-events-none absolute inset-0 -z-10'>
          <div className='absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl' />
          <div className='absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
          {/* Left: CTA */}
          <div className='space-y-4'>
            <h1 className='text-3xl md:text-5xl font-extrabold tracking-tight'>
              Play Free Online Card Games
            </h1>
            <p className='text-slate-200/90 max-w-xl'>
              Blackjack, Texas Hold&apos;em vs Bot, Flip Card, High-Low &amp;
              Snap — instant play, no signup.
            </p>
            <div className='flex flex-wrap gap-3 pt-2'>
              <Link
                href='/games/blackjack'
                className='btn-shimmer group inline-flex items-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 font-semibold shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10 transition-all duration-300 min-w-[180px] max-w-xs justify-center'
              >
                <span>▶ Play Blackjack</span>
              </Link>
              <Link
                href='/games'
                className='inline-flex items-center rounded-2xl bg-white/10 backdrop-blur px-4 py-2 font-semibold ring-1 ring-white/20 hover:bg-white/15 transition min-w-[180px] max-w-xs justify-center'
              >
                Browse All Games
              </Link>
            </div>
            <ul className='flex flex-wrap gap-2 pt-3 text-xs text-slate-200/80'>
              <li className='px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/15'>
                No signup
              </li>
              <li className='px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/15'>
                Mobile-friendly
              </li>
              <li className='px-2 py-1 rounded-full bg-white/10 ring-1 ring-white/15'>
                Free forever
              </li>
            </ul>
          </div>

          {/* Right: simple preview panel (placeholder) */}
          <div className='rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-4 md:p-6'>
            <div className='text-sm text-slate-200/80 font-semibold tracking-wide'>
              Now Trending
            </div>
            <div className='mt-3 grid grid-cols-3 gap-3'>
              <Link
                href='/games/holdem'
                className='btn-shimmer aspect-[5/3] rounded-lg bg-gradient-to-br from-fuchsia-400/30 to-indigo-400/20 ring-1 ring-white/10 flex flex-row items-center justify-center gap-2 text-sm font-semibold text-white/90'
              >
                <span className='text-2xl'>♠️</span>
                <span>Hold&apos;em</span>
              </Link>
              <Link
                href='/games/flipcard'
                className='btn-shimmer aspect-[5/3] rounded-lg bg-gradient-to-br from-cyan-400/30 to-sky-400/20 ring-1 ring-white/10 flex flex-row items-center justify-center gap-2 text-sm font-semibold text-white/90'
              >
                <span className='text-2xl'>🃏</span>
                <span>Flip Card</span>
              </Link>
              <Link
                href='/games/snap'
                className='btn-shimmer aspect-[5/3] rounded-lg bg-gradient-to-br from-amber-400/30 to-rose-400/20 ring-1 ring-white/10 flex flex-row items-center justify-center gap-2 text-sm font-semibold text-white/90'
              >
                <span className='text-2xl'>👋</span>
                <span>Snap</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className='recommendation'>
        {games.map((g) => (
          <GameCard key={g.slug} title={g.title} description={g.description} slug={g.slug} />
        ))}
      </section>
    </div>
  )
}
