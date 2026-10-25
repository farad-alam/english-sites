import type { Metadata } from 'next'
import { absoluteUrl, truncate } from './format'
import { getCountry } from './country'
import { getImageUrl } from '@/sanity/image'
import type { SanityImageValue, SiteSettings } from '@/sanity/types'

export function titleTemplate(settings: SiteSettings): string {
  const t = settings.seo.titleTemplate?.trim()
  if (t && t.includes('%s')) return t.replace('{siteName}', settings.siteName)
  return `%s | ${settings.siteName}`
}

interface PageMeta {
  settings: SiteSettings
  title?: string
  description?: string
  /** Path starting with "/" — used for canonical + og:url */
  path: string
  image?: SanityImageValue | null
  /** Overrides the computed canonical (e.g. cross-posted articles) */
  canonicalUrl?: string
  noIndex?: boolean
  type?: 'website' | 'article'
  publishedAt?: string
  modifiedAt?: string
  authors?: string[]
}

/** One place that builds the per-page <head> so every page is consistent. */
export function buildMetadata(m: PageMeta): Metadata {
  const { settings } = m
  const country = getCountry(settings.country)
  const description = truncate(m.description || settings.seo.defaultDescription || settings.tagline, 160) || undefined
  const canonical = m.canonicalUrl || absoluteUrl(m.path)
  const imageUrl =
    getImageUrl(m.image, { width: 1200, height: 630, crop: true, format: 'jpg' }) ||
    getImageUrl(settings.seo.defaultOgImage, { width: 1200, height: 630, crop: true, format: 'jpg' })
  const fullTitle = m.title ? titleTemplate(settings).replace('%s', m.title) : settings.siteName
  const twitter = settings.seo.twitterHandle?.trim().replace(/^@?/, '@')

  const metadata: Metadata = {
    ...(m.title ? { title: m.title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical, languages: { [country.hreflang]: canonical } },
    // Only set when needed: leaving the key out keeps the root layout's robots (incl. max-image-preview: large).
    ...(m.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: m.type ?? 'website',
      siteName: settings.siteName,
      title: fullTitle,
      description,
      url: canonical,
      locale: country.ogLocale,
      // Width/height are only known for images we crop ourselves (Sanity CDN); external URLs are left unsized.
      ...(imageUrl ? { images: [imageUrl.includes('cdn.sanity.io') ? { url: imageUrl, width: 1200, height: 630 } : { url: imageUrl }] } : {}),
      ...(m.type === 'article'
        ? { publishedTime: m.publishedAt, modifiedTime: m.modifiedAt, authors: m.authors }
        : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      ...(twitter ? { site: twitter } : {}),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
  return metadata
}
