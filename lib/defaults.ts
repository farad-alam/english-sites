import { DEFAULT_COUNTRY } from './country'
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT } from './fonts'
import { DEFAULT_PRESET } from './theme'
import type { HomeSection, ModuleFlags, SiteSettings } from '@/sanity/types'

/**
 * What a brand-new site looks like before anyone touches Site Settings:
 * a plain blog, emerald theme, US English. Every field has a safe default so
 * the site always renders.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'My Site',
  tagline: undefined,
  country: DEFAULT_COUNTRY,
  modules: { blog: true, affiliate: false, offers: false },
  theme: {
    preset: DEFAULT_PRESET,
    headingFont: DEFAULT_HEADING_FONT,
    bodyFont: DEFAULT_BODY_FONT,
    radius: 'soft',
  },
  nav: { links: [], showCategories: true },
  footer: { columns: [] },
  social: {},
  homeSections: [],
  ads: { autoAds: false, consentMode: 'google-cmp' },
  affiliate: { autoDisclosure: true },
  analytics: {},
  seo: {},
}

/** Home page used when Site Settings has no sections configured yet. */
export function defaultHomeSections(modules: ModuleFlags): HomeSection[] {
  const sections: HomeSection[] = [
    { _type: 'heroSection', _key: 'default-hero', variant: 'centered', showSearch: modules.blog },
  ]
  if (modules.affiliate) sections.push({ _type: 'topPicksSection', _key: 'default-picks' })
  if (modules.offers) sections.push({ _type: 'topOffersSection', _key: 'default-offers', count: 4 })
  if (modules.blog) {
    sections.push({ _type: 'latestPostsSection', _key: 'default-latest', count: 6, showViewAll: true })
    sections.push({ _type: 'categoryGridSection', _key: 'default-cats' })
  }
  sections.push({ _type: 'trustSection', _key: 'default-trust' })
  return sections
}
