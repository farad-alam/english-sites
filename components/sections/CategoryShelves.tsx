import Link from 'next/link'
import PostGrid from '@/components/blog/PostGrid'
import SectionHeading from '@/components/ui/SectionHeading'
import { getCountry } from '@/lib/country'
import { getCategories, getLatestPosts } from '@/sanity/queries'
import type { CategoryShelvesSection, SiteSettings } from '@/sanity/types'

export default async function CategoryShelves({ section, settings }: { section: CategoryShelvesSection; settings: SiteSettings }) {
  const all = await getCategories()
  const chosen = section.categoryIds?.length
    ? section.categoryIds.map((id) => all.find((c) => c._id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
    : all.filter((c) => !c.parentSlug && (c.postCount ?? 0) > 0).slice(0, 3)
  if (!chosen.length) return null

  const country = getCountry(settings.country)
  const shelves = await Promise.all(
    chosen.map(async (c) => ({ category: c, posts: await getLatestPosts({ limit: section.postsPerShelf ?? 3, categoryId: c._id }) })),
  )

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {section.title && <SectionHeading title={section.title} />}
        {shelves
          .filter((s) => s.posts.length)
          .map(({ category, posts }) => (
            <div key={category._id}>
              <div className="flex items-end justify-between gap-4 mb-5">
                <h3 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
                  {category.icon && <span className="me-2" aria-hidden="true">{category.icon}</span>}
                  {category.title}
                </h3>
                <Link href={`/category/${category.slug}`} className="inline-flex items-center min-h-[44px] text-sm font-semibold text-text-muted hover:text-brand-primary">
                  See all →
                </Link>
              </div>
              <PostGrid posts={posts} country={country} />
            </div>
          ))}
      </div>
    </section>
  )
}
