export type OgImage = {
  src: string
  width: number
  height: number
}

export type GameMeta = {
  slug: string
  title: string
  description: string
  emoji?: string
  ogImage: OgImage
  updatedAt: string
}

const og = (slug: string, width: number, height: number): OgImage => ({
  src: `/assets/img/og/${slug}_og.webp`,
  width,
  height,
})

export const games: GameMeta[] = [
  {
    slug: 'flipcard',
    title: 'Flip Card',
    description: 'Match pairs in as few moves as possible.',
    emoji: '🃏',
    ogImage: og('flipcard', 300, 210),
    updatedAt: '2026-10-13',
  },
  {
    slug: 'holdem',
    title: "Texas Hold'em VS Bot",
    description: 'A classic card game of skill and strategy.',
    emoji: '♠️',
    ogImage: og('holdem', 300, 200),
    updatedAt: '2026-10-13',
  },
  {
    slug: 'war',
    title: 'War Card Game',
    description: 'A simple card game where the highest card wins.',
    emoji: '⚔️',
    ogImage: og('war', 500, 300),
    updatedAt: '2026-10-13',
  },
  {
    slug: 'blackjack',
    title: 'Blackjack',
    description:
      'Try to beat the dealer by getting as close to 21 as possible.',
    emoji: '🃙',
    ogImage: og('blackjack', 300, 180),
    updatedAt: '2026-10-13',
  },
  {
    slug: 'highlow',
    title: 'High Low',
    description: 'Guess if the next card will be higher or lower.',
    emoji: '🔼🔽',
    ogImage: og('highlow', 500, 300),
    updatedAt: '2026-10-13',
  },
  {
    slug: 'snap',
    title: 'Snap',
    description: 'React quickly when two cards match!',
    emoji: '👋',
    ogImage: og('snap', 500, 300),
    updatedAt: '2026-10-13',
  },
]
