import PostGrid from '@/components/blog/PostGrid'
import SectionHeading from '@/components/ui/SectionHeading'
import { getCountry } from '@/lib/country'
import { getPostsByIds } from '@/sanity/queries'
import type { SiteSettings, TrendingPostsSection } from '@/sanity/types'

/**
 * Up to 6 hand-picked articles (the ones that perform best), 3 per row.
 * Shows exactly what was picked, in the picked order; nothing picked = nothing rendered.
 */
export default async function TrendingPosts({ section, settings }: { section: TrendingPostsSection; settings: SiteSettings }) {
  const posts = await getPostsByIds((section.postIds ?? []).slice(0, 6))
  if (!posts.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Trending articles'} />
        <PostGrid posts={posts} country={getCountry(settings.country)} />
      </div>
    </section>
  )
}
