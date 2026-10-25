import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortableText from '@/components/blog/PortableText'
import PostGrid from '@/components/blog/PostGrid'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import SanityImage from '@/components/ui/SanityImage'
import { getCountry } from '@/lib/country'
import { breadcrumbSchema, personSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { hasImage } from '@/sanity/image'
import { getAuthorBySlug, getAuthorSlugs, getPostsByAuthor } from '@/sanity/queries'

export const revalidate = false

type Params = { slug: string }

export async function generateStaticParams() {
  try {
    return (await getAuthorSlugs()).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const [settings, author] = await Promise.all([getSettings(), getAuthorBySlug(slug)])
  if (!settings.modules.blog || !author) return {}
  const name = `${author.firstName} ${author.lastName}`.trim()
  return buildMetadata({
    settings,
    title: `${name}${author.jobTitle ? ` — ${author.jobTitle}` : ''}`,
    description: author.shortBio || `Articles by ${name} on ${settings.siteName}.`,
    path: `/authors/${author.slug}`,
    image: author.avatar,
  })
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const [settings, author] = await Promise.all([getSettings(), getAuthorBySlug(slug)])
  if (!settings.modules.blog || !author) notFound()

  const posts = await getPostsByAuthor(slug)
  const name = `${author.firstName} ${author.lastName}`.trim()

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <JsonLd data={[personSchema(author, settings), breadcrumbSchema([{ name: 'Home', path: '/' }, { name, path: `/authors/${author.slug}` }])]} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name }]} />

      <header className="mt-6 mb-10 flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-brand-soft border border-surface-border shrink-0">
          {hasImage(author.avatar) ? (
            <SanityImage image={author.avatar} alt={author.avatar?.alt || name} sizes="96px" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-2xl text-brand-primary">
              {`${author.firstName[0] ?? ''}${author.lastName[0] ?? ''}`.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-heading font-extrabold text-3xl text-text-primary">{name}</h1>
          {author.jobTitle && <p className="text-brand-primary font-medium mt-1">{author.jobTitle}</p>}
          {author.shortBio && <p className="text-text-muted mt-3 leading-relaxed">{author.shortBio}</p>}
          {author.fullBio?.length ? (
            <div className="article-body mt-4">
              <PortableText value={author.fullBio} settings={settings} />
            </div>
          ) : null}
        </div>
      </header>

      <h2 className="font-heading font-bold text-2xl text-text-primary mb-6">Articles by {author.firstName}</h2>
      <PostGrid posts={posts} country={getCountry(settings.country)} emptyText="No articles yet." />
    </div>
  )
}
