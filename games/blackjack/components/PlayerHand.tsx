import { Card } from '../types'
import { calculateHandValue } from '../gameLogic'
import { AnimatedCard } from './AnimatedCard'
import { motion } from 'motion/react'
import styles from '../blackjack.module.css'

interface PlayerHandProps {
  hand: Card[]
  cardOffset: string
  onAnimationComplete: () => void
}

export function PlayerHand({
  hand,
  cardOffset,
  onAnimationComplete,
}: PlayerHandProps) {
  const displayValue = hand.length > 0 ? calculateHandValue(hand) : 0

  return (
    <div className={`${styles.handSection} mt-4 sm:mt-8`}>
      <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
        Your Hand ({displayValue})
      </h2>
      <motion.div className={styles.playerHand}>
        {hand.map((card, idx) => (
          <AnimatedCard
            key={`player-${card.suit}-${card.rank}-${idx}`}
            card={card}
            idx={idx}
            cardOffset={cardOffset}
            flyFrom={{ x: 350, y: -150 }}
            isLatest={idx === hand.length - 1}
            onAnimationComplete={onAnimationComplete}
          />
        ))}
      </motion.div>
    </div>
  )
}
