import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Card Station — Free Online Card Games',
  description: 'Learn about Card Station: free online card & memory mini games like Blackjack, Texas Hold\'em vs Bot, Flip Card, High Low & Snap. No signup, just play.',
  alternates: { canonical: site.url ? `${site.url}/about` : undefined }
}

export default function About() {
  return (
    <div className='max-w-2xl mx-auto py-16 px-4'>
      <h1 className='text-3xl font-bold mb-8'>About Card Station - Play Free Online Card Games</h1>
      <p className='my-4'>
        Card Station is a fun and interactive online platform where you can play free card games like Texas Hold&apos;em, Flip Card, and other classic card games. Our modern, user-friendly interface makes it easy to enjoy multiplayer card games, compete with friends, and discover new strategies anytime, anywhere.
      </p>
      <p className='my-4'>
        Our mission is to make online card games accessible and exciting for everyone. We focus on simplicity, mobile-friendly design, and a smooth user experience. Whether you&apos;re learning the rules, practicing strategies, or just looking for casual fun, Card Station is the best place to play cards online.
      </p>
      <p>
        Have feedback or suggestions for new card games? Contact us anytime—we'd love to hear from you and keep improving Card Station for card game enthusiasts worldwide.
      </p>
      <div className='text-sm text-gray-500 mt-12'>
        Special thanks to all the talented art creators whose work inspires and
        enhances our platform:
        <br />
        <p className='py-2'>
          Cards designed by{' '}
          <a href='http://www.freepik.com'>pikisuperstar / Freepik</a>
        </p>
      </div>
    </div>
  )
}
