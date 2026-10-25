import { urlset, type SitemapEntry } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  const settings = await getSettings()
  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/about', changefreq: 'yearly', priority: 0.4 },
    { path: '/contact', changefreq: 'yearly', priority: 0.3 },
    { path: '/privacy', changefreq: 'yearly', priority: 0.2 },
    { path: '/terms', changefreq: 'yearly', priority: 0.2 },
  ]
  if (settings.modules.blog) entries.splice(1, 0, { path: '/blog', changefreq: 'daily', priority: 0.8 })
  if (settings.modules.offers) entries.splice(1, 0, { path: '/offers', changefreq: 'weekly', priority: 0.8 })
  if (settings.modules.affiliate || settings.modules.offers) entries.push({ path: '/disclosure', changefreq: 'yearly', priority: 0.2 })
  return urlset(entries)
}
