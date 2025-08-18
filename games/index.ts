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
  // {
  //   slug: 'sheep-game',
  //   title: 'Sheep Sheep',
  //   description:
  //     "Match 3 tiles in the dock to clear the board. Don't fill up the dock!",
  //   emoji: '🀄️',
  // },
  {
    slug: 'holdem',
    title: 'Texas Hold\'em VS Bot',
    description: 'A classic card game of skill and strategy.',
    emoji: '♠️',
  }
]
