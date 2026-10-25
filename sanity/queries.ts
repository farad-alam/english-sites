import { cache } from 'react'
import { sanityFetch } from './client'
import { PAGE_SIZE } from '@/lib/config'
import type {
  AffiliateLinkData,
  Author,
  Category,
  Offer,
  OfferCardData,
  PostCardData,
  Post,
  SearchEntry,
  SiteSettings,
  StaticPageData,
} from './types'

/**
 * Cache tags (the Sanity webhook expires these — see app/api/revalidate/route.ts)
 *   siteSettings    site-wide settings
 *   posts           any list that shows many posts (home, /blog, search, sitemap)
 *   post:<slug>     one article
 *   category:<id>   lists scoped to one category (category page, related posts)
 *   categories      the category list (nav, footer, grids)
 *   authors         author documents
 *   offers          offer lists
 *   offer:<slug>    one offer page
 *   affiliateLinks  managed affiliate links (/go/…)
 *   staticPages     about / privacy / terms / disclosure / contact
 */

// ── Fragments ───────────────────────────────────────────────────────────────

const IMAGE = `{ asset, hotspot, crop, alt, externalUrl }`
const PUBLISHED = `_type == "post" && defined(slug.current) && publishedAt <= now()`
/** Published and not marked noindex — what lists, related articles, counts and search show. */
const LISTED = `${PUBLISHED} && noIndex != true`

const CATEGORY_REF = `{ _id, title, "slug": slug.current }`
const AUTHOR_REF = `{ firstName, lastName, "slug": slug.current, avatar ${IMAGE}, jobTitle }`
const LINK_REF = `{ "slug": slug.current, name, kind, asin, url }`

const POST_CARD = `{
  _id, title, "slug": slug.current, excerpt,
  mainImage ${IMAGE},
  publishedAt, updatedAt, articleType, overallRating,
  "readMinutes": round(length(pt::text(body)) / 1250),
  "category": category->${CATEGORY_REF},
  "author": author->${AUTHOR_REF}
}`

const OFFER_CARD = `{
  _id, name, "slug": slug.current, tagline, logo ${IMAGE}, rating,
  startingPrice, pricingModel, freeTrial, bestFor, promoCode, promoNote, featured, url,
  "category": category->${CATEGORY_REF},
  "link": link->${LINK_REF}
}`

/** Portable Text body with the references our custom blocks point at resolved inline. */
const BODY = `body[]{
  ...,
  _type == "productCard" => { ..., "link": link->${LINK_REF} },
  _type == "productComparisonTable" => { ..., products[]{ ..., "link": link->${LINK_REF} } },
  _type == "offerCard" => { ..., "offer": offer->${OFFER_CARD} }
}`

// ── Site settings ───────────────────────────────────────────────────────────

export const getSettingsRaw = cache(async (): Promise<Partial<SiteSettings> | null> => {
  return sanityFetch<Partial<SiteSettings> | null>({
    query: `*[_type == "siteSettings"][0]{
      ...,
      logo ${IMAGE},
      favicon ${IMAGE},
      seo { ..., defaultOgImage ${IMAGE} },
      homeSections[]{
        ...,
        _type == "heroSection" => { image ${IMAGE} },
        _type == "latestPostsSection" => { "categoryId": category._ref },
        _type == "featuredPostsSection" => { "postIds": posts[]._ref },
        _type == "categoryShelvesSection" => { "categoryIds": categories[]._ref },
        _type == "topOffersSection" => { "offerIds": offers[]._ref },
        _type == "topPicksSection" => {
          items[]{
            ...,
            image ${IMAGE},
            "postId": post._ref,
            "offerId": offer._ref,
            "linkSlug": link->slug.current
          }
        }
      }
    }`,
    tags: ['siteSettings'],
    fallback: null,
  })
})

// ── Posts ───────────────────────────────────────────────────────────────────

export const getLatestPosts = cache(
  async (opts: { limit?: number; offset?: number; categoryId?: string } = {}): Promise<PostCardData[]> => {
    const { limit = PAGE_SIZE, offset = 0, categoryId } = opts
    return sanityFetch<PostCardData[]>({
      query: `*[${LISTED}${categoryId ? ' && category._ref == $categoryId' : ''}]
        | order(publishedAt desc) [$offset...$end] ${POST_CARD}`,
      params: { offset, end: offset + limit, ...(categoryId ? { categoryId } : {}) },
      tags: categoryId ? [`category:${categoryId}`] : ['posts'],
      fallback: [],
    })
  },
)

export const countPosts = cache(async (categoryId?: string): Promise<number> => {
  return sanityFetch<number>({
    query: `count(*[${LISTED}${categoryId ? ' && category._ref == $categoryId' : ''}])`,
    params: categoryId ? { categoryId } : {},
    tags: categoryId ? [`category:${categoryId}`] : ['posts'],
    fallback: 0,
  })
})

export const getPostsByIds = cache(async (ids: string[]): Promise<PostCardData[]> => {
  if (!ids.length) return []
  const rows = await sanityFetch<PostCardData[]>({
    query: `*[_id in $ids && ${PUBLISHED}] ${POST_CARD}`,
    params: { ids },
    tags: ['posts'],
    fallback: [],
  })
  const byId = new Map(rows.map((r) => [r._id, r]))
  return ids.map((id) => byId.get(id)).filter((r): r is PostCardData => Boolean(r))
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  return sanityFetch<Post | null>({
    query: `*[${PUBLISHED} && slug.current == $slug][0]{
      _id, title, "slug": slug.current, excerpt,
      mainImage ${IMAGE},
      publishedAt, updatedAt, articleType, overallRating,
      seoTitle, seoDescription, keywords, canonicalUrl, noIndex, noAds, affiliateDisclosure, reviewedItem,
      "readMinutes": round(length(pt::text(body)) / 1250),
      "category": category->${CATEGORY_REF},
      "author": author->{
        firstName, lastName, "slug": slug.current, avatar ${IMAGE}, jobTitle,
        shortBio, expertiseAreas, yearsExperience, linkedin, x, website
      },
      ${BODY}
    }`,
    params: { slug },
    tags: [`post:${slug}`, 'authors', 'offers', 'affiliateLinks'],
    fallback: null,
  })
})

/**
 * Same-category articles first; if there are fewer than `limit`, the newest
 * articles from elsewhere fill the gaps. The second query (and its broad
 * "posts" tag) only runs for small categories, so on a mature site publishing
 * one article does not invalidate every other article page.
 */
export const getRelatedPosts = cache(
  async (categoryId: string | undefined, excludeId: string, limit = 4): Promise<PostCardData[]> => {
    const same = categoryId
      ? await sanityFetch<PostCardData[]>({
          query: `*[${LISTED} && _id != $excludeId && category._ref == $categoryId]
            | order(publishedAt desc) [0...$limit] ${POST_CARD}`,
          params: { excludeId, categoryId, limit },
          tags: [`category:${categoryId}`],
          fallback: [],
        })
      : []
    if (same.length >= limit) return same

    const others = await sanityFetch<PostCardData[]>({
      query: `*[${LISTED} && !(_id in $skip)] | order(publishedAt desc) [0...$limit] ${POST_CARD}`,
      params: { skip: [excludeId, ...same.map((p) => p._id)], limit: limit - same.length },
      tags: ['posts'],
      fallback: [],
    })
    return [...same, ...others]
  },
)

export const getPostSlugs = cache(async (limit = 100): Promise<string[]> => {
  return sanityFetch<string[]>({
    query: `*[${PUBLISHED}] | order(publishedAt desc) [0...$limit].slug.current`,
    params: { limit },
    tags: ['posts'],
    fallback: [],
  })
})

export const getPostsForSitemap = cache(async () => {
  return sanityFetch<{ slug: string; updatedAt?: string; publishedAt: string; noIndex?: boolean }[]>({
    query: `*[${LISTED}] | order(publishedAt desc) {
      "slug": slug.current, publishedAt, "updatedAt": coalesce(updatedAt, _updatedAt)
    }`,
    tags: ['posts'],
    fallback: [],
  })
})

export const getSearchIndex = cache(async (): Promise<SearchEntry[]> => {
  return sanityFetch<SearchEntry[]>({
    query: `*[${LISTED}] | order(publishedAt desc) {
      title, "slug": slug.current, excerpt, publishedAt,
      "categoryTitle": category->title, mainImage ${IMAGE}
    }`,
    tags: ['posts', 'categories'],
    fallback: [],
  })
})

// ── Categories ──────────────────────────────────────────────────────────────

export const getCategories = cache(async (): Promise<Category[]> => {
  return sanityFetch<Category[]>({
    query: `*[_type == "category" && defined(slug.current)] | order(coalesce(order, 999) asc, title asc) {
      _id, title, "slug": slug.current, description, icon, order,
      "parentSlug": parent->slug.current, "parentTitle": parent->title,
      "postCount": count(*[${LISTED} && references(^._id)])
    }`,
    tags: ['categories', 'posts'],
    fallback: [],
  })
})

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  return sanityFetch<Category | null>({
    query: `*[_type == "category" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, description, icon, order,
      "parentSlug": parent->slug.current, "parentTitle": parent->title
    }`,
    params: { slug },
    tags: ['categories'],
    fallback: null,
  })
})

// ── Authors ─────────────────────────────────────────────────────────────────

export const getAuthorBySlug = cache(async (slug: string): Promise<Author | null> => {
  return sanityFetch<Author | null>({
    query: `*[_type == "author" && slug.current == $slug][0]{
      firstName, lastName, "slug": slug.current, avatar ${IMAGE}, jobTitle,
      shortBio, fullBio, expertiseAreas, yearsExperience, linkedin, x, website
    }`,
    params: { slug },
    tags: ['authors'],
    fallback: null,
  })
})

export const getPostsByAuthor = cache(async (slug: string): Promise<PostCardData[]> => {
  return sanityFetch<PostCardData[]>({
    query: `*[${LISTED} && author->slug.current == $slug] | order(publishedAt desc) [0...48] ${POST_CARD}`,
    params: { slug },
    tags: ['posts', 'authors'],
    fallback: [],
  })
})

export const getAuthorSlugs = cache(async (): Promise<string[]> => {
  return sanityFetch<string[]>({
    query: `*[_type == "author" && defined(slug.current)].slug.current`,
    tags: ['authors'],
    fallback: [],
  })
})

// ── Offers ──────────────────────────────────────────────────────────────────

const OFFER_PUBLISHED = `_type == "offer" && defined(slug.current)`

export const getOffers = cache(async (opts: { limit?: number; featuredFirst?: boolean } = {}): Promise<OfferCardData[]> => {
  const { limit = 48, featuredFirst = true } = opts
  return sanityFetch<OfferCardData[]>({
    query: `*[${OFFER_PUBLISHED}] | order(${featuredFirst ? 'featured desc, ' : ''}coalesce(order, 999) asc, rating desc) [0...$limit] ${OFFER_CARD}`,
    params: { limit },
    tags: ['offers'],
    fallback: [],
  })
})

export const getOffersByIds = cache(async (ids: string[]): Promise<OfferCardData[]> => {
  if (!ids.length) return []
  const rows = await sanityFetch<OfferCardData[]>({
    query: `*[_id in $ids && ${OFFER_PUBLISHED}] ${OFFER_CARD}`,
    params: { ids },
    tags: ['offers'],
    fallback: [],
  })
  const byId = new Map(rows.map((r) => [r._id, r]))
  return ids.map((id) => byId.get(id)).filter((r): r is OfferCardData => Boolean(r))
})

export const getOfferBySlug = cache(async (slug: string): Promise<Offer | null> => {
  return sanityFetch<Offer | null>({
    query: `*[${OFFER_PUBLISHED} && slug.current == $slug][0]{
      _id, name, "slug": slug.current, tagline, logo ${IMAGE}, rating,
      startingPrice, pricingModel, freeTrial, bestFor, promoCode, promoNote, featured, url,
      summary, features, pros, cons, publishedAt, "updatedAt": coalesce(updatedAt, _updatedAt),
      seoTitle, seoDescription, noIndex,
      "category": category->${CATEGORY_REF},
      "link": link->${LINK_REF},
      "author": author->${AUTHOR_REF},
      ${BODY}
    }`,
    params: { slug },
    tags: [`offer:${slug}`, 'authors', 'affiliateLinks'],
    fallback: null,
  })
})

export const getOffersForSitemap = cache(async () => {
  return sanityFetch<{ slug: string; updatedAt?: string }[]>({
    query: `*[${OFFER_PUBLISHED} && noIndex != true] { "slug": slug.current, "updatedAt": coalesce(updatedAt, _updatedAt) }`,
    tags: ['offers'],
    fallback: [],
  })
})

// ── Affiliate links ─────────────────────────────────────────────────────────

export const getAffiliateLink = cache(async (slug: string): Promise<AffiliateLinkData | null> => {
  return sanityFetch<AffiliateLinkData | null>({
    query: `*[_type == "affiliateLink" && slug.current == $slug][0]{ "slug": slug.current, name, kind, asin, url }`,
    params: { slug },
    tags: ['affiliateLinks'],
    fallback: null,
  })
})

// ── Static pages ────────────────────────────────────────────────────────────

export const getStaticPage = cache(async (key: string): Promise<StaticPageData | null> => {
  return sanityFetch<StaticPageData | null>({
    query: `*[_type == "staticPage" && key == $key][0]{
      key, title, description, intro, body, "updatedAt": coalesce(updatedAt, _updatedAt)
    }`,
    params: { key },
    tags: ['staticPages'],
    fallback: null,
  })
})

// ── Navigation (kept light so a new article never invalidates every page) ──

export const getNavCategories = cache(async (): Promise<Pick<Category, '_id' | 'title' | 'slug'>[]> => {
  return sanityFetch<Pick<Category, '_id' | 'title' | 'slug'>[]>({
    query: `*[_type == "category" && defined(slug.current) && !defined(parent)]
      | order(coalesce(order, 999) asc, title asc) [0...8] { _id, title, "slug": slug.current }`,
    tags: ['categories'],
    fallback: [],
  })
})
