import { GamePhase } from '../types'
import styles from '../blackjack.module.css'

interface GameControlsProps {
  phase: GamePhase
  animationLock: boolean
  autoPlayEnabled: boolean
  canDouble: boolean
  canSplit: boolean
  canSurrender: boolean
  canAffordInsurance: boolean
  insuranceCost: number
  startHand: () => void
  hit: () => void
  stand: () => void
  doubleDown: () => void
  split: () => void
  surrender: () => void
  takeInsurance: () => void
  declineInsurance: () => void
  toggleAutoPlay: () => void
}

export function GameControls({
  phase,
  animationLock,
  autoPlayEnabled,
  canDouble,
  canSplit,
  canSurrender,
  canAffordInsurance,
  insuranceCost,
  startHand,
  hit,
  stand,
  doubleDown,
  split,
  surrender,
  takeInsurance,
  declineInsurance,
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

  if (phase === 'insurance-prompt') {
    return (
      <div className={styles.buttonGroup}>
        <button
          onClick={takeInsurance}
          disabled={!canAffordInsurance}
          className={`${styles.button} ${styles.insuranceButton} w-36 sm:w-auto py-3 sm:py-2`}
        >
          Insurance (${insuranceCost})
        </button>
        <button
          onClick={declineInsurance}
          className={`${styles.button} ${styles.declineButton} w-36 sm:w-auto py-3 sm:py-2`}
        >
          No Insurance
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
          className={`${styles.button} ${styles.hitButton} min-w-[96px] py-3 sm:py-2`}
        >
          Hit
        </button>
        <button
          onClick={stand}
          disabled={animationLock}
          className={`${styles.button} ${styles.standButton} min-w-[96px] py-3 sm:py-2`}
        >
          Stand
        </button>
        {canDouble && (
          <button
            onClick={doubleDown}
            disabled={animationLock}
            className={`${styles.button} ${styles.doubleButton} min-w-[96px] py-3 sm:py-2`}
          >
            Double
          </button>
        )}
        {canSplit && (
          <button
            onClick={split}
            disabled={animationLock}
            className={`${styles.button} ${styles.splitButton} min-w-[96px] py-3 sm:py-2`}
          >
            Split
          </button>
        )}
        {canSurrender && (
          <button
            onClick={surrender}
            disabled={animationLock}
            className={`${styles.button} ${styles.surrenderButton} min-w-[120px] py-3 sm:py-2`}
          >
            Surrender
          </button>
        )}
      </div>
    )
  }

  return <div />
}
