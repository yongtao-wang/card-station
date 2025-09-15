import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Card Station — Free Online Card Games',
  description: "Learn about Card Station: free online card & memory mini games like Blackjack, Texas Hold'em vs Bot, Flip Card, High Low & Snap. No signup, just play.",
  alternates: { canonical: site.url ? `${site.url}/about` : undefined },
}

export default function About() {
  return (
    <div className='max-w-2xl mx-auto py-16 px-4'>
      <h1 className='text-3xl font-bold mb-8'>About Card Station – Your Home for Modern Card Games</h1>
      <p className='my-4'>
        Card Station is a vibrant online destination where classic card games are reimagined for the digital age. Dive into a growing collection of beautifully animated games—like Texas Hold&apos;em VS Bot, Blackjack, Flip Card, High Low, Snap, and War—each crafted for instant play with no downloads or signups required.
      </p>
      <p className='my-4'>
        Whether you&apos;re a seasoned strategist or a casual gamer, Card Station offers something for everyone. Enjoy smooth, mobile-friendly gameplay, intuitive drag-and-drop controls, and lively Framer Motion animations that bring every card to life. Our platform is designed for quick fun, deep learning, and friendly competition—play solo, challenge friends, or sharpen your skills against smart bots.
      </p>
      <p className='my-4'>
        We&apos;re passionate about making card games accessible, visually stunning, and endlessly replayable. Every game includes clear rules, helpful tips, and a welcoming interface—so you can focus on the thrill of the game, not the hassle of setup. New games and features are added regularly, inspired by feedback from our global community of card lovers.
      </p>
      <p>
        Have ideas, requests, or just want to say hello? Reach out anytime! We&apos;re always listening and excited to make Card Station the best place to play cards online—one shuffle at a time.
      </p>

      <div className='mt-12 space-y-8'>
        <section>
          <h2 className='text-2xl font-semibold mb-4 text-blue-400'>🎮 Our Game Collection</h2>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='bg-gray-800/50 p-4 rounded-lg'>
              <h3 className='font-semibold text-green-400 mb-2'>Strategy Games</h3>
              <p className='text-sm text-gray-300'>Texas Hold&apos;em VS Bot and Blackjack challenge your decision-making skills with authentic casino-style gameplay and intelligent AI opponents.</p>
            </div>
            <div className='bg-gray-800/50 p-4 rounded-lg'>
              <h3 className='font-semibold text-purple-400 mb-2'>Memory & Reflex</h3>
              <p className='text-sm text-gray-300'>Flip Card tests your memory while Snap challenges your reflexes. Perfect for quick brain training sessions.</p>
            </div>
            <div className='bg-gray-800/50 p-4 rounded-lg'>
              <h3 className='font-semibold text-orange-400 mb-2'>Prediction Games</h3>
              <p className='text-sm text-gray-300'>High Low puts your intuition to the test with probability-based card guessing gameplay.</p>
            </div>
            <div className='bg-gray-800/50 p-4 rounded-lg'>
              <h3 className='font-semibold text-red-400 mb-2'>Classic War</h3>
              <p className='text-sm text-gray-300'>Experience the timeless card battle where high card wins, featuring dramatic war sequences and animated card combat.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4 text-yellow-400'>✨ What Makes Us Special</h2>
          <div className='bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg'>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <span className='text-green-400 mt-1'>🚀</span>
                <div>
                  <strong>Instant Play:</strong> No downloads, no registration, no waiting. Click and play immediately on any device.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-blue-400 mt-1'>📱</span>
                <div>
                  <strong>Mobile-First Design:</strong> Optimized for touch controls with responsive layouts that work perfectly on phones, tablets, and desktops.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-purple-400 mt-1'>🎨</span>
                <div>
                  <strong>Smooth Animations:</strong> Powered by Framer Motion for fluid card movements, satisfying interactions, and delightful visual feedback.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-orange-400 mt-1'>🎯</span>
                <div>
                  <strong>Smart AI:</strong> Challenge yourself against intelligent bots that adapt to different skill levels and playing styles.
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-pink-400 mt-1'>💾</span>
                <div>
                  <strong>Progress Tracking:</strong> Your game statistics and achievements are automatically saved locally for each session.
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4 text-green-400'>🌟 Built with Modern Technology</h2>
          <div className='bg-gray-800/50 p-6 rounded-lg'>
            <p className='mb-4 text-gray-300'>
              Card Station is built using cutting-edge web technologies to ensure fast loading, smooth performance, and an exceptional user experience:
            </p>
            <div className='grid gap-3 md:grid-cols-3'>
              <div className='text-center p-3 bg-gray-700/50 rounded'>
                <div className='text-2xl mb-2'>⚡</div>
                <div className='text-sm'>Next.js 15 for lightning-fast performance</div>
              </div>
              <div className='text-center p-3 bg-gray-700/50 rounded'>
                <div className='text-2xl mb-2'>🎭</div>
                <div className='text-sm'>Framer Motion for silky-smooth animations</div>
              </div>
              <div className='text-center p-3 bg-gray-700/50 rounded'>
                <div className='text-2xl mb-2'>🎨</div>
                <div className='text-sm'>Tailwind CSS for beautiful, responsive design</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className='text-sm text-gray-500 mt-12'>
        Special thanks to all the talented art creators whose work inspires and
        enhances our platform:
        <br />
        <span className='py-2'>
          Cards designed by{' '}
          <a href='http://www.freepik.com'>pikisuperstar / Freepik</a>
        </span>
      </div>
    </div>
  )
}
