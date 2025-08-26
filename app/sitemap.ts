import { MetadataRoute } from 'next'
import { games } from '@/games/index'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url || 'http://localhost:3000'
  const now = new Date().toISOString()
  const staticUrls: MetadataRoute.Sitemap = [
    '',
    '/about'
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.5 }))

  const gameUrls: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${base}/games/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  return [...staticUrls, ...gameUrls]
}