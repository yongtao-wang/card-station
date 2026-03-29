import { GamePhase } from '../types'
import styles from '../blackjack.module.css'

interface GameControlsProps {
  phase: GamePhase
  animationLock: boolean
  autoPlayEnabled: boolean
  startHand: () => void
  hit: () => void
  stand: () => void
  toggleAutoPlay: () => void
}

export function GameControls({
  phase,
  animationLock,
  autoPlayEnabled,
  startHand,
  hit,
  stand,
  toggleAutoPlay,
}: GameControlsProps) {
  if (phase === 'betting') {
    return (
      <div className={styles.buttonGroup}>
        <button
          onClick={startHand}
          className={`${styles.button} ${styles.dealButton} w-36 sm:w-32 py-3 sm:py-2`}
        >
          Deal
        </button>
        <button
          onClick={toggleAutoPlay}
          className={`${styles.button} ${styles.autoPlayButton} ${
            !autoPlayEnabled ? styles.disabled : ''
          } w-36 sm:w-[160px] py-1 sm:py-2 text-base`}
          title='Toggle Auto Play (basic strategy)'
        >
          Auto Play:{autoPlayEnabled ? ' ON' : ' OFF'}
        </button>
      </div>
    )
  }

  if (phase === 'player-turn') {
    return (
      <div className={styles.buttonGroup}>
        <button
          onClick={hit}
          disabled={animationLock}
          className={`${styles.button} ${styles.hitButton} w-36 sm:w-24 py-3 sm:py-2`}
        >
          Hit
        </button>
        <button
          onClick={stand}
          disabled={animationLock}
          className={`${styles.button} ${styles.standButton} w-36 sm:w-24 py-3 sm:py-2`}
        >
          Stand
        </button>
      </div>
    )
  }

  return <div />
}
