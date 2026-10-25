import type { CountryCode } from '@/lib/country'

// ── Primitives ──────────────────────────────────────────────────────────────

export interface SanityImageValue {
  asset?: { _ref?: string; _type?: string } | null
  hotspot?: { x: number; y: number; width: number; height: number } | null
  crop?: { top: number; bottom: number; left: number; right: number } | null
  alt?: string
  /** Bulk-import escape hatch: a plain image URL instead of an upload */
  externalUrl?: string
}

export type PortableTextBlock = {
  _type: string
  _key: string
  [key: string]: unknown
}

export interface NavLink {
  _key?: string
  label: string
  href: string
  newTab?: boolean
}

// ── Site Settings ───────────────────────────────────────────────────────────

export interface ModuleFlags {
  blog: boolean
  affiliate: boolean
  offers: boolean
}

export type ModuleName = keyof ModuleFlags

export interface HomeCta {
  label?: string
  href?: string
}

export interface HeroSection {
  _type: 'heroSection'
  _key: string
  eyebrow?: string
  heading?: string
  subheading?: string
  variant?: 'centered' | 'split'
  showSearch?: boolean
  primaryCta?: HomeCta
  secondaryCta?: HomeCta
  image?: SanityImageValue
}

export interface LatestPostsSection {
  _type: 'latestPostsSection'
  _key: string
  title?: string
  count?: number
  categoryId?: string
  showViewAll?: boolean
}

export interface FeaturedPostsSection {
  _type: 'featuredPostsSection'
  _key: string
  title?: string
  postIds?: string[]
}

export interface CategoryShelvesSection {
  _type: 'categoryShelvesSection'
  _key: string
  title?: string
  categoryIds?: string[]
  postsPerShelf?: number
}

export interface CategoryGridSection {
  _type: 'categoryGridSection'
  _key: string
  title?: string
}

export interface PickItem {
  _key: string
  badge?: string
  title?: string
  summary?: string
  rating?: number
  image?: SanityImageValue
  ctaLabel?: string
  postId?: string
  offerId?: string
  linkSlug?: string
  url?: string
}

export interface TopPicksSection {
  _type: 'topPicksSection'
  _key: string
  title?: string
  subtitle?: string
  items?: PickItem[]
}

export interface TopOffersSection {
  _type: 'topOffersSection'
  _key: string
  title?: string
  subtitle?: string
  count?: number
  offerIds?: string[]
}

export interface FaqSection {
  _type: 'faqSection'
  _key: string
  title?: string
  items?: { _key: string; question: string; answer: string }[]
}

export interface TrustSection {
  _type: 'trustSection'
  _key: string
  items?: { _key: string; icon?: string; title: string; text?: string }[]
}

export interface RichTextSection {
  _type: 'richTextSection'
  _key: string
  title?: string
  body?: PortableTextBlock[]
}

export interface CtaSection {
  _type: 'ctaSection'
  _key: string
  heading?: string
  text?: string
  buttonLabel?: string
  buttonHref?: string
}

export type HomeSection =
  | HeroSection
  | LatestPostsSection
  | FeaturedPostsSection
  | CategoryShelvesSection
  | CategoryGridSection
  | TopPicksSection
  | TopOffersSection
  | FaqSection
  | TrustSection
  | RichTextSection
  | CtaSection

export interface SiteSettings {
  siteName: string
  tagline?: string
  country: CountryCode
  logo?: SanityImageValue
  logoHeight?: number
  favicon?: SanityImageValue
  contactEmail?: string

  modules: ModuleFlags

  theme: {
    preset?: string
    primary?: string
    accent?: string
    headingFont?: string
    bodyFont?: string
    radius?: string
  }

  nav: {
    links: NavLink[]
    showCategories: boolean
    ctaLabel?: string
    ctaHref?: string
  }

  footer: {
    blurb?: string
    columns: { _key?: string; title: string; links: NavLink[] }[]
    copyright?: string
  }

  social: {
    x?: string
    facebook?: string
    instagram?: string
    youtube?: string
    pinterest?: string
    tiktok?: string
    linkedin?: string
  }

  homeSections: HomeSection[]

  ads: {
    adsenseClientId?: string
    autoAds: boolean
    topSlot?: string
    inArticleSlot?: string
    sidebarSlot?: string
    extraAdsTxt?: string
    consentMode: 'off' | 'google-cmp'
  }

  affiliate: {
    amazonTag?: string
    disclosureText?: string
    autoDisclosure: boolean
  }

  analytics: {
    ga4Id?: string
    clarityId?: string
    googleVerification?: string
    bingVerification?: string
  }

  seo: {
    titleTemplate?: string
    defaultDescription?: string
    defaultOgImage?: SanityImageValue
    twitterHandle?: string
  }
}

// ── Content ─────────────────────────────────────────────────────────────────

export interface CategoryRef {
  _id: string
  title: string
  slug: string
}

export interface Category extends CategoryRef {
  description?: string
  icon?: string
  order?: number
  parentSlug?: string
  parentTitle?: string
  postCount?: number
}

export interface AuthorRef {
  firstName: string
  lastName: string
  slug: string
  avatar?: SanityImageValue
  jobTitle?: string
}

export interface Author extends AuthorRef {
  shortBio?: string
  fullBio?: PortableTextBlock[]
  expertiseAreas?: string[]
  yearsExperience?: number
  linkedin?: string
  x?: string
  website?: string
}

export interface PostCardData {
  _id: string
  title: string
  slug: string
  excerpt?: string
  mainImage?: SanityImageValue
  publishedAt: string
  updatedAt?: string
  articleType?: string
  overallRating?: number
  readMinutes?: number
  category?: CategoryRef
  author?: AuthorRef
}

export interface Post extends PostCardData {
  body?: PortableTextBlock[]
  seoTitle?: string
  seoDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  noAds?: boolean
  affiliateDisclosure?: boolean
  reviewedItem?: { name?: string; brand?: string }
  author?: Author
}

export interface AffiliateLinkData {
  slug: string
  name: string
  kind: 'amazon' | 'url'
  asin?: string
  url?: string
}

export interface OfferCardData {
  _id: string
  name: string
  slug: string
  tagline?: string
  logo?: SanityImageValue
  rating?: number
  startingPrice?: string
  pricingModel?: string
  freeTrial?: string
  bestFor?: string
  promoCode?: string
  promoNote?: string
  featured?: boolean
  category?: CategoryRef
  link?: AffiliateLinkData
  url?: string
}

export interface Offer extends OfferCardData {
  summary?: string
  features?: string[]
  pros?: string[]
  cons?: string[]
  body?: PortableTextBlock[]
  publishedAt?: string
  updatedAt?: string
  seoTitle?: string
  seoDescription?: string
  noIndex?: boolean
  author?: AuthorRef
}

export interface StaticPageData {
  key: string
  title: string
  description?: string
  intro?: string
  body?: PortableTextBlock[]
  updatedAt?: string
}

export interface SearchEntry {
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  categoryTitle?: string
  mainImage?: SanityImageValue
}
