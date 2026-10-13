import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Card Station',
    short_name: 'Card Station',
    description: 'Free online card games. Instant play, no signup.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0b1c',
    theme_color: '#19162e',
    icons: [
      {
        src: '/assets/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
