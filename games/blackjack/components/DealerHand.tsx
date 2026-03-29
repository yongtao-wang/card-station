import { Card, GamePhase } from '../types'
import { calculateHandValue } from '../gameLogic'
import { AnimatedCard } from './AnimatedCard'
import styles from '../blackjack.module.css'

interface DealerHandProps {
  hand: Card[]
  phase: GamePhase
  cardOffset: string
  onAnimationComplete: () => void
}

const REVEALED_PHASES: GamePhase[] = [
  'dealer-revealing',
  'dealer-hitting',
  'resolving',
  'result',
]

export function DealerHand({
  hand,
  phase,
  cardOffset,
  onAnimationComplete,
}: DealerHandProps) {
  const isRevealed = REVEALED_PHASES.includes(phase)
  const displayValue = isRevealed ? calculateHandValue(hand) : '?'

  return (
    <div className={`${styles.handSection} mb-4 sm:mb-8`}>
      <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
        Dealer ({displayValue})
      </h2>
      <div className={styles.dealerHand}>
        {hand.map((card, idx) => (
          <AnimatedCard
            key={`dealer-${card.suit}-${card.rank}-${idx}`}
            card={card}
            idx={idx}
            cardOffset={cardOffset}
            flyFrom={{ x: 350, y: 150 }}
            isLatest={idx === hand.length - 1}
            onAnimationComplete={onAnimationComplete}
          />
        ))}
      </div>
    </div>
  )
}
