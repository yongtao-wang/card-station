import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b border-black/5 bg-white/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl text-teal-700">
          🎴 Flip Cardie
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="link">Home</Link>
          <Link href="/games/flip-card" className="link">Flip Card</Link>
          <a className="link" href="https://nextjs.org" target="_blank" rel="noreferrer">About</a>
        </nav>
      </div>
    </header>
  )
}
