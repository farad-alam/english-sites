import { DEFAULT_COUNTRY } from './country'
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT } from './fonts'
import { DEFAULT_HOME_SECTIONS } from './home-template'
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
  nav: { items: [], maxVisible: 6 },
  footer: { style: 'brand', columns: [] },
  social: {},
  homeSections: [],
  ads: { autoAds: false, consentMode: 'google-cmp' },
  affiliate: { autoDisclosure: true },
  analytics: {},
  seo: {},
}

/**
 * Home page used when Site Settings has no sections yet: the built-in template
 * (lib/home-template.ts) minus blocks that start hidden, plus the extras a site
 * with the Affiliate / Offers modules expects.
 */
export function defaultHomeSections(modules: ModuleFlags): HomeSection[] {
  const sections = (DEFAULT_HOME_SECTIONS as unknown as (HomeSection & { disabled?: boolean })[]).filter((s) => !s.disabled)
  if (modules.affiliate) sections.push({ _type: 'topPicksSection', _key: 'default-picks' })
  if (modules.offers) sections.push({ _type: 'topOffersSection', _key: 'default-offers', count: 4 })
  return sections
}
