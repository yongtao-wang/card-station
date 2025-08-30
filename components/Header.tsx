import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className='w-full sticky top-0 z-20'>
      <div className='mx-auto max-w-6xl px-4 h-14 flex items-center justify-between bg-transparent backdrop-blur'>
        <Link
          href='/'
          className='font-extrabold text-lg md:text-xl text-white hover:opacity-90 inline-flex items-center gap-2'
        >
          <span className='inline-grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white'>
            <Image
              src='/assets/icons/android-chrome-192x192.png'
              alt='Card Station Logo'
              width={28}
              height={28}
            />
          </span>
          <span>Card Station</span>
        </Link>
        <nav className='flex items-center gap-4 text-sm'>
          <Link href='/' className='text-slate-200 hover:text-white'>
            HOME
          </Link>
          <Link href='/about' className='text-slate-200 hover:text-white'>
            ABOUT
          </Link>
        </nav>
      </div>
    </header>
  )
}
