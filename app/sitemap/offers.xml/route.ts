import { urlset } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'
import { getOffersForSitemap } from '@/sanity/queries'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  const settings = await getSettings()
  if (!settings.modules.offers) return new Response('Not found', { status: 404 })
  const offers = await getOffersForSitemap()
  return urlset(offers.map((o) => ({ path: `/offers/${o.slug}`, lastmod: o.updatedAt, changefreq: 'weekly', priority: 0.7 })))
}
