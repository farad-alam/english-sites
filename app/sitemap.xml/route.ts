import { sitemapIndex } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'
import { getCategories } from '@/sanity/queries'
import { isCategoryIndexable } from '@/lib/category-index'

export const dynamic = 'force-static'
export const revalidate = false

/** Index of sub-sitemaps — only the modules this site has switched on are listed. */
export async function GET() {
  const settings = await getSettings()
  const paths = ['/sitemap/pages.xml']
  if (settings.modules.blog) {
    // Category pages are noindex by default, so they only appear here once a category qualifies.
    const categories = await getCategories()
    if (categories.some((c) => isCategoryIndexable(c.postCount ?? 0, settings.seo?.indexCategoriesMinPosts))) paths.push('/sitemap/categories.xml')
    paths.push('/sitemap/articles.xml')
  }
  if (settings.modules.offers) paths.push('/sitemap/offers.xml')
  return sitemapIndex(paths)
}
