type Props = { title: string; description: string; emoji?: string }

export default function GameCard({ title, description, emoji = '🎴' }: Props) {
  return (
    <div className="card p-4 h-full cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="font-bold text-lg">{title}</div>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  )
}
