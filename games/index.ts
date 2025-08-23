export type GameMeta = {
  slug: string
  title: string
  description: string
  emoji?: string
}

export const games: GameMeta[] = [
  {
    slug: 'flip-card',
    title: 'Flip Card',
    description: 'Match pairs in as few moves as possible.',
    emoji: '🃏',
  },
  {
    slug: 'holdem',
    title: "Texas Hold'em VS Bot",
    description: 'A classic card game of skill and strategy.',
    emoji: '♠️',
  },
  {
    slug: 'war',
    title: 'War Card Game',
    description: 'A simple card game where the highest card wins.',
    emoji: '⚔️',
  },
  {
    slug: 'blackjack',
    title: 'Blackjack',
    description:
      'Try to beat the dealer by getting as close to 21 as possible.',
    emoji: '🃙',
  },
  {
    slug: 'highlow',
    title: 'High Low',
    description: 'Guess if the next card will be higher or lower.',
    emoji: '🔼🔽',
  }
  ,
  {
    slug: 'snap',
    title: 'Snap',
    description: 'React quickly when two cards match!',
    emoji: '👋',
  }
]
