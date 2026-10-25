import { urlset } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'
import { getCategories } from '@/sanity/queries'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  const settings = await getSettings()
  if (!settings.modules.blog) return new Response('Not found', { status: 404 })
  const categories = (await getCategories()).filter((c) => (c.postCount ?? 0) > 0)
  return urlset(categories.map((c) => ({ path: `/category/${c.slug}`, changefreq: 'daily', priority: 0.7 })))
}
