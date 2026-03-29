import AnimatedNumber from '@/components/AnimatedNumber'

interface BetDisplayProps {
  betAmount: number
}

export function BetDisplay({ betAmount }: BetDisplayProps) {
  return (
    <div className='bg-green-900 border-4 border-yellow-500 rounded-full w-24 h-24 sm:w-28 sm:h-28 flex flex-col justify-center items-center shadow-lg m-1 sm:m-2'>
      <label className='text-yellow-400 text-center text-sm sm:text-base translate-y-1'>
        Current Bet
      </label>
      <span className='text-center text-white text-base sm:text-lg font-bold translate-y-1 block h-[1.5em] overflow-hidden'>
        $<AnimatedNumber value={betAmount} />
      </span>
    </div>
  )
}
