import { GamePhase } from '../types'
import styles from '../blackjack.module.css'

interface BettingControlsProps {
  phase: GamePhase
  addToBet: (amount: number) => void
}

export function BettingControls({ phase, addToBet }: BettingControlsProps) {
  const disabled = phase !== 'betting'

  return (
    <div className='text-center'>
      <div className='text-white text-base mb-2'>Place Your Bet:</div>
      <div className='grid grid-cols-2 text-xl gap-2'>
        {[1, 10, 50, 100].map((amount) => (
          <button
            key={amount}
            onClick={() => addToBet(amount)}
            disabled={disabled}
            className={styles.betButton}
          >
            +${amount}
          </button>
        ))}
      </div>
    </div>
  )
}
