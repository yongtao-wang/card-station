import { Hand, GamePhase } from '../types'
import { calculateHandValue } from '../gameLogic'
import { AnimatedCard } from './AnimatedCard'
import { motion } from 'motion/react'
import styles from '../blackjack.module.css'

interface PlayerHandProps {
  hands: Hand[]
  activeHandIndex: number
  phase: GamePhase
  cardOffset: string
  onAnimationComplete: () => void
}

export function PlayerHand({
  hands,
  activeHandIndex,
  phase,
  cardOffset,
  onAnimationComplete,
}: PlayerHandProps) {
  const isPlayPhase = phase === 'player-turn' || phase === 'switching-hand'
  const multiHand = hands.length > 1

  if (hands.length === 0) {
    return (
      <div className={`${styles.handSection} mt-4 sm:mt-8`}>
        <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
          Your Hand (0)
        </h2>
        <motion.div className={styles.playerHand} />
      </div>
    )
  }

  return (
    <div className={`${multiHand ? styles.playerHandsContainer : ''} mt-4 sm:mt-8`}>
      {hands.map((hand, handIdx) => {
        const displayValue = hand.cards.length > 0 ? calculateHandValue(hand.cards) : 0
        const isActive = handIdx === activeHandIndex && isPlayPhase
        const label = multiHand ? `Hand ${handIdx + 1}` : 'Your Hand'

        return (
          <div
            key={handIdx}
            className={`${styles.handSection} ${
              multiHand ? (isActive ? styles.activeHand : styles.inactiveHand) : ''
            }`}
          >
            <h2 className={`${styles.handTitle} text-sm sm:text-lg`}>
              {label} ({displayValue})
              {multiHand && hand.isDoubled && ' 2x'}
              {hand.result === 'busted' && ' 💥'}
              {hand.result === 'stood' && !isPlayPhase && ' ✋'}
            </h2>
            <motion.div className={styles.playerHand}>
              {hand.cards.map((card, idx) => (
                <AnimatedCard
                  key={`player-${handIdx}-${card.suit}-${card.rank}-${idx}`}
                  card={card}
                  idx={idx}
                  cardOffset={cardOffset}
                  flyFrom={{ x: 350, y: -150 }}
                  onAnimationComplete={onAnimationComplete}
                />
              ))}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
