import { getCountry } from './country'
import type { AffiliateLinkData, SiteSettings } from '@/sanity/types'

export const AFFILIATE_REL = 'noopener noreferrer nofollow sponsored'

type LinkSettings = Pick<SiteSettings, 'country' | 'affiliate' | 'modules'>

/**
 * Amazon product URL for the site's country, tagged with the site's Associates
 * ID — but only while the Affiliate module is on, so a site that switched
 * affiliate features off never earns (or has to disclose) commission by accident.
 */
export function amazonUrl(asin: string, settings: LinkSettings): string {
  const { amazonDomain } = getCountry(settings.country)
  const tag = settings.modules.affiliate ? settings.affiliate.amazonTag?.trim() : undefined
  const clean = asin.trim().toUpperCase()
  return `https://www.${amazonDomain}/dp/${encodeURIComponent(clean)}${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`
}

/** Normalises a destination URL: keeps http(s) only. */
function safeHttpUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : undefined
  } catch {
    return undefined
  }
}

/** Final destination of an affiliate link document (used by the /go/ redirect). */
export function destinationOf(link: AffiliateLinkData, settings: LinkSettings): string | undefined {
  if (link.kind === 'amazon' && link.asin) return amazonUrl(link.asin, settings)
  return safeHttpUrl(link.url)
}

interface Linkable {
  link?: Partial<AffiliateLinkData> | null
  asin?: string
  url?: string
  affiliateUrl?: string
}

/**
 * The href a "Buy / Visit" button should use.
 *  1. a managed affiliate link  → /go/slug  (trackable, editable in one place)
 *     (if the Affiliate module is off, the link's own destination is used instead)
 *  2. an Amazon ASIN            → tagged store link for the site's country
 *  3. a plain URL               → used as-is
 */
export function resolveHref(item: Linkable, settings: LinkSettings): string | undefined {
  if (item.link) {
    if (settings.modules.affiliate && item.link.slug) return `/go/${item.link.slug}`
    const direct = destinationOf(item.link as AffiliateLinkData, settings)
    if (direct) return direct
  }
  if (item.asin) return amazonUrl(item.asin, settings)
  return safeHttpUrl(item.url ?? item.affiliateUrl)
}

export function isExternal(href: string | undefined): boolean {
  return Boolean(href && /^https?:\/\//i.test(href))
}

/** Default button text: names Amazon when the link is an ASIN. */
export function defaultCtaLabel(asin?: string, linkKind?: string): string {
  return asin || linkKind === 'amazon' ? 'Check price on Amazon' : 'View deal'
}
