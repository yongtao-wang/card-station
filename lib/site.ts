export const site = {
  name: 'Card Station',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
  author: 'Card Station',
  locale: 'en_US',
}

export function withSiteUrl(path: string) {
  return site.url ? `${site.url}${path}` : path
}
