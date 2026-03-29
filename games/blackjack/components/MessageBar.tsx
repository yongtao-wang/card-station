interface MessageBarProps {
  message: string
  autoPlayEnabled: boolean
}

export function MessageBar({ message, autoPlayEnabled }: MessageBarProps) {
  return (
    <div className='bg-green-700 rounded-lg p-2 sm:p-4 mb-2 sm:mb-4 text-white text-center'>
      <p className='text-yellow-300 mt-1 sm:mt-2 text-lg sm:text-xl min-h-[24px] sm:min-h-[32px]'>
        {message}
      </p>
      <p className='text-xs sm:text-sm mt-1 opacity-80'>
        {autoPlayEnabled
          ? 'Auto Play enabled (basic strategy)'
          : 'Manual play'}
      </p>
    </div>
  )
}
