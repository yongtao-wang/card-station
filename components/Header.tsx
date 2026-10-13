import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className='w-full sticky top-0 z-20'>
      <div className='mx-auto max-w-6xl px-4 h-14 flex items-center justify-between bg-transparent backdrop-blur'>
        <Link
          href='/'
          className='shrink-0 font-extrabold text-lg md:text-xl text-white hover:opacity-90 inline-flex items-center gap-2 whitespace-nowrap'
        >
          <span className='inline-grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white'>
            <Image
              src='/assets/icons/android-chrome-192x192.png'
              alt='Card Station Logo'
              width={32}
              height={32}
            />
          </span>
          <span className='hidden min-[380px]:inline'>Card Station</span>
        </Link>
        <nav className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm'>
          <Link href='/' className='text-slate-200 hover:text-white'>
            HOME
          </Link>
          <Link href='/games' className='text-slate-200 hover:text-white'>
            GAMES
          </Link>
          <Link href='/about' className='text-slate-200 hover:text-white'>
            ABOUT
          </Link>
          <Link href='/contact' className='text-slate-200 hover:text-white'>
            CONTACT
          </Link>
        </nav>
      </div>
    </header>
  )
}
