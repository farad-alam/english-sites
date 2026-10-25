import { getSettings } from '@/lib/settings'
import { getSearchIndex } from '@/sanity/queries'
import { getImageUrl } from '@/sanity/image'

export const dynamic = 'force-static'
export const revalidate = false

/** Compact index for the client-side search page. Refreshed when the `posts` tag is expired. */
export async function GET() {
  const settings = await getSettings()
  if (!settings.modules.blog) return new Response('Not found', { status: 404 })
  const entries = await getSearchIndex()
  return Response.json(
    entries.map((e) => ({
      title: e.title,
      slug: e.slug,
      excerpt: e.excerpt ?? '',
      publishedAt: e.publishedAt,
      categoryTitle: e.categoryTitle ?? '',
      image: getImageUrl(e.mainImage, { width: 352, height: 198, crop: true }) ?? null,
      imageAlt: e.mainImage?.alt ?? e.title,
    })),
  )
}
