import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostGrid from '@/components/blog/PostGrid'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import Pagination from '@/components/ui/Pagination'
import SectionHeading from '@/components/ui/SectionHeading'
import { PAGE_SIZE } from '@/lib/config'
import { getCountry } from '@/lib/country'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { countPosts, getCategories, getCategoryBySlug, getLatestPosts } from '@/sanity/queries'

export async function categoryMetadata(slug: string, page: number): Promise<Metadata> {
  const [settings, category] = await Promise.all([getSettings(), getCategoryBySlug(slug)])
  if (!settings.modules.blog || !category) return {}
  const total = await countPosts(category._id)
  return buildMetadata({
    settings,
    title: page > 1 ? `${category.title} — page ${page}` : category.title,
    description: category.description || `The latest ${category.title} articles from ${settings.siteName}.`,
    path: page > 1 ? `/category/${slug}/page/${page}` : `/category/${slug}`,
    noIndex: total === 0, // don't ask Google to index an empty page
  })
}

export default async function CategoryView({ slug, page }: { slug: string; page: number }) {
  const [settings, category] = await Promise.all([getSettings(), getCategoryBySlug(slug)])
  if (!settings.modules.blog || !category) notFound()

  const total = await countPosts(category._id)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) notFound()
  const [posts, allCategories] = await Promise.all([
    getLatestPosts({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, categoryId: category._id }),
    getCategories(),
  ])
  const children = allCategories.filter((c) => c.parentSlug === category.slug && (c.postCount ?? 0) > 0)
  const basePath = `/category/${category.slug}`

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: category.title, path: basePath }])} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: category.title }]} />
      <div className="mt-6">
        <SectionHeading as="h1" title={`${category.icon ? `${category.icon} ` : ''}${category.title}`} subtitle={category.description} />
      </div>

      {children.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-8" aria-label="Sub-categories">
          {children.map((c) => (
            <li key={c._id}>
              <a href={`/category/${c.slug}`} className="inline-flex items-center min-h-[40px] px-4 rounded-full border border-surface-border bg-surface-card text-sm font-medium hover:border-brand-primary/50 hover:text-brand-primary">
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <PostGrid posts={posts} country={getCountry(settings.country)} priorityFirst emptyText="No articles in this category yet." />
      <Pagination page={page} totalPages={totalPages} basePath={basePath} />
    </div>
  )
}
