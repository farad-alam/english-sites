import { absoluteUrl } from './format'
import { getCountry } from './country'
import { getImageUrl } from '@/sanity/image'
import type { Author, Offer, Post, SiteSettings } from '@/sanity/types'

/** JSON-LD builders. Every URL, language and publisher comes from Site Settings. */

export function socialUrls(settings: SiteSettings): string[] {
  return Object.values(settings.social).filter((v): v is string => Boolean(v))
}

export function websiteSchema(settings: SiteSettings) {
  const country = getCountry(settings.country)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.siteName,
    url: absoluteUrl('/'),
    inLanguage: country.htmlLang,
    ...(settings.modules.blog
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/search')}?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  }
}

export function organizationSchema(settings: SiteSettings) {
  const logo = getImageUrl(settings.logo, { width: 512 })
  const sameAs = socialUrls(settings)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url: absoluteUrl('/'),
    ...(logo ? { logo: { '@type': 'ImageObject', url: logo } } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

function publisher(settings: SiteSettings) {
  const logo = getImageUrl(settings.logo, { width: 512 })
  return {
    '@type': 'Organization',
    name: settings.siteName,
    url: absoluteUrl('/'),
    ...(logo ? { logo: { '@type': 'ImageObject', url: logo } } : {}),
  }
}

function authorNode(author: Author | undefined, settings: SiteSettings) {
  if (!author) return { '@type': 'Organization', name: settings.siteName, url: absoluteUrl('/') }
  return {
    '@type': 'Person',
    name: `${author.firstName} ${author.lastName}`.trim(),
    url: absoluteUrl(`/authors/${author.slug}`),
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
  }
}

export function articleSchema(post: Post, settings: SiteSettings, wordCount?: number) {
  const country = getCountry(settings.country)
  const url = absoluteUrl(`/${post.slug}`)
  const image = getImageUrl(post.mainImage, { width: 1200, height: 630, crop: true, format: 'jpg' })
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: country.htmlLang,
    ...(post.keywords?.length ? { keywords: post.keywords.join(', ') } : {}),
    ...(image ? { image: [image] } : {}),
    ...(wordCount ? { wordCount } : {}),
    author: authorNode(post.author, settings),
    publisher: publisher(settings),
  }
}

/**
 * Review markup for single-product review posts. We only emit it when the editor
 * filled in "Reviewed item" AND a rating — never an aggregateRating we invented.
 */
export function reviewSchema(post: Post, settings: SiteSettings) {
  if (post.articleType !== 'review' || !post.reviewedItem?.name || typeof post.overallRating !== 'number') return null
  const image = getImageUrl(post.mainImage, { width: 1200, height: 630, crop: true, format: 'jpg' })
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: post.title,
    url: absoluteUrl(`/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: authorNode(post.author, settings),
    publisher: publisher(settings),
    reviewRating: { '@type': 'Rating', ratingValue: post.overallRating, bestRating: 5, worstRating: 1 },
    itemReviewed: {
      '@type': 'Product',
      name: post.reviewedItem.name,
      ...(post.reviewedItem.brand ? { brand: { '@type': 'Brand', name: post.reviewedItem.brand } } : {}),
      ...(image ? { image } : {}),
    },
  }
}

export function offerReviewSchema(offer: Offer, settings: SiteSettings) {
  if (typeof offer.rating !== 'number') return null
  const logo = getImageUrl(offer.logo, { width: 512 })
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${offer.name} review`,
    url: absoluteUrl(`/offers/${offer.slug}`),
    ...(offer.publishedAt ? { datePublished: offer.publishedAt } : {}),
    ...(offer.updatedAt ? { dateModified: offer.updatedAt } : {}),
    author: authorNode(offer.author as Author | undefined, settings),
    publisher: publisher(settings),
    reviewRating: { '@type': 'Rating', ratingValue: offer.rating, bestRating: 5, worstRating: 1 },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: offer.name,
      applicationCategory: offer.category?.title ?? 'BusinessApplication',
      operatingSystem: 'Web',
      ...(offer.summary || offer.tagline ? { description: offer.summary || offer.tagline } : {}),
      ...(logo ? { image: logo } : {}),
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

export function personSchema(author: Author, settings: SiteSettings) {
  const sameAs = [author.linkedin, author.x, author.website].filter(Boolean)
  const avatar = getImageUrl(author.avatar, { width: 400, height: 400, crop: true })
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${author.firstName} ${author.lastName}`.trim(),
    url: absoluteUrl(`/authors/${author.slug}`),
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(author.shortBio ? { description: author.shortBio } : {}),
    ...(avatar ? { image: avatar } : {}),
    ...(author.expertiseAreas?.length ? { knowsAbout: author.expertiseAreas } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { '@type': 'Organization', name: settings.siteName, url: absoluteUrl('/') },
  }
}
