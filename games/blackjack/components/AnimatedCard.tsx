import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Card } from '../types'
import { getCardSvgPath } from '../gameLogic'
import styles from '../blackjack.module.css'

interface AnimatedCardProps {
  card: Card
  idx: number
  cardOffset: string
  flyFrom?: { x: number; y: number }
  onAnimationComplete?: () => void
}

export const AnimatedCard = memo(function AnimatedCard({
  card,
  idx,
  cardOffset,
  flyFrom,
  onAnimationComplete,
}: AnimatedCardProps) {
  const targetRotation = card.faceDown ? 0 : 180

  return (
    <motion.div
      className={styles.card}
      style={{
        marginLeft: idx > 0 ? cardOffset : '0',
        zIndex: idx + 1,
      }}
      initial={{
        x: flyFrom?.x || 400,
        y: flyFrom?.y || 0,
        opacity: 0,
        scale: 0.8,
        rotate: 15,
      }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 25,
        mass: 1,
      }}
      onAnimationComplete={() => {
        onAnimationComplete?.()
      }}
    >
      <motion.div
        className={styles.cardFlipWrapper}
        animate={{ rotateY: targetRotation }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        {/* Card back */}
        <div
          className={styles.cardSide}
          style={{ transform: 'rotateY(0deg)' }}
        >
          <Image
            src='/assets/img/cards/card_back.jpg'
            alt='Card back'
            fill
            sizes='100vw'
            className={styles.cardImage}
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        {/* Card face */}
        <div
          className={styles.cardSide}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <Image
            src={getCardSvgPath(card)}
            alt={`${card.rank} of ${card.suit}`}
            fill
            sizes='100vw'
            className={styles.cardImage}
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  )
})
