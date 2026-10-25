import { sitemapIndex } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-static'
export const revalidate = false

/** Index of sub-sitemaps — only the modules this site has switched on are listed. */
export async function GET() {
  const settings = await getSettings()
  const paths = ['/sitemap/pages.xml']
  if (settings.modules.blog) paths.push('/sitemap/categories.xml', '/sitemap/articles.xml')
  if (settings.modules.offers) paths.push('/sitemap/offers.xml')
  return sitemapIndex(paths)
}
