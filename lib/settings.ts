import { cache } from 'react'
import { DEFAULT_SETTINGS } from './defaults'
import { getCountry } from './country'
import { getSettingsRaw } from '@/sanity/queries'
import type { HomeSection, ModuleFlags, ModuleName, NavLink, SiteSettings } from '@/sanity/types'

/** False when an internal link points at a page that a switched-off module has removed. */
function linkAllowed(href: string | undefined | null, modules: ModuleFlags): boolean {
  if (!href || !href.startsWith('/')) return true
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const under = (base: string) => path === base || path.startsWith(`${base}/`)
  if (!modules.offers && under('/offers')) return false
  if (!modules.blog && (under('/blog') || under('/category') || under('/authors') || under('/search'))) return false
  return true
}

/** Drops menu items, buttons and section buttons that would lead to a 404 because their module is off. */
function pruneLinks(settings: SiteSettings): SiteSettings {
  const { modules } = settings
  const ok = (href?: string | null) => linkAllowed(href, modules)
  const keep = (links: NavLink[] | undefined) => (links ?? []).filter((l) => ok(l.href))
  const cta = settings.nav.ctaHref && !ok(settings.nav.ctaHref)

  const sections = settings.homeSections.map((section): HomeSection => {
    if (section._type === 'heroSection') {
      return {
        ...section,
        primaryCta: ok(section.primaryCta?.href) ? section.primaryCta : undefined,
        secondaryCta: ok(section.secondaryCta?.href) ? section.secondaryCta : undefined,
      }
    }
    if (section._type === 'ctaSection' && !ok(section.buttonHref)) return { ...section, buttonHref: undefined, buttonLabel: undefined }
    return section
  })

  return {
    ...settings,
    nav: { ...settings.nav, links: keep(settings.nav.links), ...(cta ? { ctaHref: undefined, ctaLabel: undefined } : {}) },
    footer: {
      ...settings.footer,
      columns: settings.footer.columns.map((c) => ({ ...c, links: keep(c.links) })).filter((c) => c.links.length),
    },
    homeSections: sections,
  }
}

/** Merge whatever Sanity returned over the defaults, so no field is ever undefined. */
export function normalizeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  return pruneLinks(mergeSettings(raw))
}

function mergeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  const d = DEFAULT_SETTINGS
  const r = raw ?? {}
  return {
    ...d,
    ...r,
    siteName: r.siteName?.trim() || d.siteName,
    country: getCountry(r.country).code,
    modules: { ...d.modules, ...(r.modules ?? {}) },
    theme: { ...d.theme, ...stripNulls(r.theme) },
    nav: {
      ...d.nav,
      ...stripNulls(r.nav),
      links: r.nav?.links ?? [],
      showCategories: r.nav?.showCategories ?? d.nav.showCategories,
    },
    footer: { ...d.footer, ...stripNulls(r.footer), columns: r.footer?.columns ?? [] },
    social: { ...stripNulls(r.social) },
    homeSections: r.homeSections ?? [],
    ads: {
      ...d.ads,
      ...stripNulls(r.ads),
      autoAds: r.ads?.autoAds ?? d.ads.autoAds,
      consentMode: r.ads?.consentMode ?? d.ads.consentMode,
    },
    affiliate: {
      ...d.affiliate,
      ...stripNulls(r.affiliate),
      autoDisclosure: r.affiliate?.autoDisclosure ?? d.affiliate.autoDisclosure,
    },
    analytics: { ...stripNulls(r.analytics) },
    seo: {
      ...d.seo,
      ...stripNulls(r.seo),
    },
  }
}

function stripNulls<T extends object | undefined>(obj: T): T {
  if (!obj) return {} as T
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== '')) as T
}

/** Per-request memoised: layout, page and generateMetadata share one fetch. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  return normalizeSettings(await getSettingsRaw())
})

export function moduleEnabled(settings: SiteSettings, name: ModuleName): boolean {
  return settings.modules[name] === true
}

export { getCountry }
