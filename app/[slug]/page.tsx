import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Ad from '@/components/ads/Ad'
import AffiliateDisclosure from '@/components/blog/AffiliateDisclosure'
import AuthorBox from '@/components/blog/AuthorBox'
import PortableText from '@/components/blog/PortableText'
import ReadingProgress from '@/components/blog/ReadingProgress'
import RelatedArticles from '@/components/blog/RelatedArticles'
import ShareButtons from '@/components/blog/ShareButtons'
import TableOfContents from '@/components/blog/TableOfContents'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import SanityImage from '@/components/ui/SanityImage'
import { splitBodyForAds } from '@/lib/ads'
import { getCountry } from '@/lib/country'
import { absoluteUrl, formatDate, readTimeLabel } from '@/lib/format'
import { collectFaqs, getHeadings, wordCount } from '@/lib/headings'
import { articleSchema, breadcrumbSchema, faqSchema, reviewSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { hasImage } from '@/sanity/image'
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/sanity/queries'
import type { PortableTextBlock, Post, SiteSettings } from '@/sanity/types'

export const revalidate = false

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  try {
    return (await getPostSlugs(100)).map((slug) => ({ slug }))
  } catch {
    return [] // build still succeeds; pages are then generated on first visit and cached
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const [settings, post] = await Promise.all([getSettings(), getPostBySlug(slug)])
  if (!settings.modules.blog || !post) return {}
  return buildMetadata({
    settings,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/${post.slug}`,
    image: post.mainImage,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
    type: 'article',
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt || post.publishedAt,
    authors: post.author ? [`${post.author.firstName} ${post.author.lastName}`.trim()] : undefined,
  })
}

const AFFILIATE_BLOCKS = new Set(['productCard', 'productComparisonTable', 'offerCard'])

function shouldShowDisclosure(post: Post, settings: SiteSettings): boolean {
  if (!settings.modules.affiliate && !settings.modules.offers) return false
  if (post.affiliateDisclosure) return true
  if (!settings.affiliate.autoDisclosure) return false
  const hasAffiliateBlocks = (post.body ?? []).some((b) => AFFILIATE_BLOCKS.has(b._type))
  return post.articleType === 'review' || post.articleType === 'comparison' || hasAffiliateBlocks
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const [settings, post] = await Promise.all([getSettings(), getPostBySlug(slug)])
  if (!settings.modules.blog || !post) notFound()

  const country = getCountry(settings.country)
  const related = await getRelatedPosts(post.category?._id, post._id, 4)
  const body: PortableTextBlock[] = post.body ?? []
  const headings = getHeadings(body)
  const faqs = collectFaqs(body)
  const showAds = !post.noAds && Boolean(settings.ads.adsenseClientId)
  const chunks = showAds && settings.ads.inArticleSlot ? splitBodyForAds(body) : [body]
  const url = absoluteUrl(`/${post.slug}`)
  const readTime = readTimeLabel(post.readMinutes)
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}`.trim() : null
  const updated = post.updatedAt && post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10)

  const crumbs = [
    { name: 'Home', path: '/' },
    ...(post.category ? [{ name: post.category.title, path: `/category/${post.category.slug}` }] : []),
    { name: post.title, path: `/${post.slug}` },
  ]

  return (
    <>
      <JsonLd data={[articleSchema(post, settings, wordCount(body)), reviewSchema(post, settings), faqSchema(faqs), breadcrumbSchema(crumbs)]} />
      <ReadingProgress targetId="article-body" />

      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c))} />

        <div className="mt-6 grid xl:grid-cols-[minmax(0,1fr)_300px] gap-12">
          <article className="min-w-0 max-w-3xl w-full mx-auto">
            <header>
              {post.category && (
                <Link href={`/category/${post.category.slug}`} className="inline-flex items-center min-h-[32px] text-xs font-bold uppercase tracking-wide text-brand-primary hover:underline">
                  {post.category.title}
                </Link>
              )}
              <h1 className="mt-1 font-heading font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.2] text-text-primary text-balance">{post.title}</h1>
              {post.excerpt && <p className="mt-4 text-lg text-text-muted leading-relaxed">{post.excerpt}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
                {authorName && post.author && (
                  <Link href={`/authors/${post.author.slug}`} className="font-semibold text-text-primary hover:text-brand-primary">
                    {authorName}
                  </Link>
                )}
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, country)}</time>
                {updated && <span>· Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt, country)}</time></span>}
                {readTime && <span>· {readTime}</span>}
              </div>
            </header>

            {shouldShowDisclosure(post, settings) && <AffiliateDisclosure settings={settings} />}

            {hasImage(post.mainImage) && (
              <figure className="my-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-raised border border-surface-border">
                  <SanityImage image={post.mainImage} alt={post.mainImage?.alt || post.title} priority sizes="(min-width: 1280px) 768px, 100vw" />
                </div>
              </figure>
            )}

            {showAds && <Ad settings={settings} position="top" />}

            <TableOfContents items={headings} variant="mobile" />

            <div id="article-body" className="article-body">
              {chunks.map((chunk, i) => (
                <div key={i}>
                  <PortableText value={chunk} settings={settings} headings={headings} />
                  {showAds && i < chunks.length - 1 && <Ad settings={settings} position="inArticle" />}
                </div>
              ))}
            </div>

            <ShareButtons title={post.title} url={url} twitterHandle={settings.seo.twitterHandle} />
            <AuthorBox author={post.author} settings={settings} />
            <RelatedArticles posts={related} country={country} variant="rail" className="xl:hidden" />
          </article>

          <aside className="hidden xl:block" aria-label="Article sidebar">
            <div className="sticky top-24 space-y-6">
              <TableOfContents items={headings} variant="desktop" />
              {showAds && <Ad settings={settings} position="sidebar" />}
              <RelatedArticles posts={related} country={country} variant="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

