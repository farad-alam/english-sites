import { urlset } from '@/lib/sitemap'
import { getSettings } from '@/lib/settings'
import { getPostsForSitemap } from '@/sanity/queries'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
  const settings = await getSettings()
  if (!settings.modules.blog) return new Response('Not found', { status: 404 })
  const posts = await getPostsForSitemap()
  return urlset(posts.map((p) => ({ path: `/${p.slug}`, lastmod: p.updatedAt || p.publishedAt, changefreq: 'weekly', priority: 0.8 })))
}
