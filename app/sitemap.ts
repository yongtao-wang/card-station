import { MetadataRoute } from 'next'
import { games } from '@/games/index'
import { site } from '@/lib/site'

export const pageUpdatedAt = {
  home: '2026-10-13',
  about: '2026-10-13',
  games: '2026-10-13',
  contact: '2026-10-13',
} as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url || 'http://localhost:3000'
  const staticPages = [
    { path: '', updatedAt: pageUpdatedAt.home, priority: 1 },
    { path: '/about', updatedAt: pageUpdatedAt.about, priority: 0.5 },
    { path: '/games', updatedAt: pageUpdatedAt.games, priority: 0.5 },
    { path: '/contact', updatedAt: pageUpdatedAt.contact, priority: 0.5 },
  ]

  const staticUrls: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: page.updatedAt,
    changeFrequency: 'weekly',
    priority: page.priority,
  }))

  const gameUrls: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${base}/games/${game.slug}`,
    lastModified: game.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticUrls, ...gameUrls]
}
