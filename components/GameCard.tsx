type Props = { title: string; description: string; emoji?: string }

export default function GameCard({ title, description, emoji = '🎴' }: Props) {
  return (
    <div className='rounded-lg bg-white/5 backdrop-blur ring-1 ring-white/10 flex flex-col items-center justify-center gap-3 p-6 hover:scale-[1.02] transition h-full aspect-[5/3]'>
      <div className='flex items-center gap-2'>
        <span className='text-3xl'>{emoji}</span>
        <span className='font-semibold text-white/90 text-center'>{title}</span>
      </div>
      <p className='text-xs text-white/70 text-center'>{description}</p>
    </div>
  )
}
