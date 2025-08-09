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
]
