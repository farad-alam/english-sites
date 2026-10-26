import PostGrid from '@/components/blog/PostGrid'
import SectionHeading from '@/components/ui/SectionHeading'
import { getCountry } from '@/lib/country'
import { getLatestPosts } from '@/sanity/queries'
import type { LatestPostsSection, SiteSettings } from '@/sanity/types'

export default async function LatestPosts({ section, settings }: { section: LatestPostsSection; settings: SiteSettings }) {
  const limit = Math.min(24, Math.max(3, Math.round(section.count ?? 6)))
  const posts = await getLatestPosts({ limit, categoryId: section.categoryId })
  if (!posts.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Recently published'} href={section.showViewAll !== false ? '/blog' : undefined} linkLabel="All articles" />
        <PostGrid posts={posts} country={getCountry(settings.country)} />
      </div>
    </section>
  )
}
