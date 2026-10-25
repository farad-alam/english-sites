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
import { countPosts, getLatestPosts } from '@/sanity/queries'

export async function blogMetadata(page: number): Promise<Metadata> {
  const settings = await getSettings()
  if (!settings.modules.blog) return {}
  return buildMetadata({
    settings,
    title: page > 1 ? `All articles — page ${page}` : 'All articles',
    description: `Every article on ${settings.siteName}, newest first.`,
    path: page > 1 ? `/blog/page/${page}` : '/blog',
  })
}

export default async function BlogView({ page }: { page: number }) {
  const settings = await getSettings()
  if (!settings.modules.blog) notFound()

  const total = await countPosts()
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) notFound()
  const posts = await getLatestPosts({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Articles', path: '/blog' }])} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Articles' }]} />
      <div className="mt-6">
        <SectionHeading as="h1" title="All articles" subtitle={`${total} article${total === 1 ? '' : 's'}`} />
      </div>
      <PostGrid posts={posts} country={getCountry(settings.country)} priorityFirst />
      <Pagination page={page} totalPages={totalPages} basePath="/blog" />
    </div>
  )
}
