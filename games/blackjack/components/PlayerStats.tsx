import styles from '../blackjack.module.css'

interface PlayerStatsProps {
  chips: number
  wins: number
  losses: number
  showResetDropdown: boolean
  isClosingDropdown: boolean
  resetChips: () => void
}

export function PlayerStats({
  chips,
  wins,
  losses,
  showResetDropdown,
  isClosingDropdown,
  resetChips,
}: PlayerStatsProps) {
  const winRate =
    wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0.0'

  return (
    <div className='absolute top-2 right-2 sm:top-4 sm:right-4 text-white shadow-lg w-[60px] min-w-[50px] sm:min-w-[200px] z-40'>
      <div className='relative p-2 sm:p-4 border-b border-slate-700 rounded-lg bg-slate-800 z-50'>
        <h3 className='text-yellow-400 text-sm sm:text-lg font-bold text-center mb-2 sm:mb-3'>
          Player Stats
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-center'>
          <div>
            <div className='text-green-400 text-sm sm:text-xl font-bold'>
              ${chips}
            </div>
            <div className='text-gray-300 text-xs sm:text-sm'>Balance</div>
          </div>
          <div>
            <div className='text-yellow-400 text-sm sm:text-xl font-bold'>
              {winRate}%
            </div>
            <div className='text-gray-300 text-xs sm:text-sm'>Win Rate</div>
          </div>
          <div>
            <div className='text-green-400 text-sm sm:text-xl font-bold'>
              {wins}
            </div>
            <div className='text-gray-300 text-xs sm:text-sm'>Wins</div>
          </div>
          <div>
            <div className='text-red-400 text-sm sm:text-xl font-bold'>
              {losses}
            </div>
            <div className='text-gray-300 text-xs sm:text-sm'>Losses</div>
          </div>
        </div>
      </div>

      {showResetDropdown && (
        <div
          className={`${styles.resetDropdown} ${
            isClosingDropdown ? styles.closing : ''
          } -translate-y-3`}
        >
          <p>Reset balance to $1000 to continue playing.</p>
          <div className='flex justify-content-center mt-1'>
            <button
              onClick={resetChips}
              className={styles.confirmButton}
              disabled={isClosingDropdown}
            >
              Reset Chips
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
