import { pageLabel } from './pages'
import type { LinkEntry, NavCategory, SiteSettings } from '@/sanity/types'

/**
 * Turns what the editor saved (Site Settings → Header menu / Footer) into plain
 * links the header and footer can render. Nothing here fetches data.
 */

/** A menu entry ready to render. `children` become a drop-down. */
export interface MenuItem {
  label: string
  href: string
  newTab?: boolean
  /** Emoji icon (categories only) */
  icon?: string
  children?: MenuItem[]
}

const categoryHref = (c: Pick<NavCategory, 'slug'>) => `/category/${c.slug}`

function topLevel(categories: NavCategory[]): NavCategory[] {
  const ids = new Set(categories.map((c) => c._id))
  // A category whose parent was deleted is shown as top-level rather than vanishing.
  return categories.filter((c) => !c.parentId || !ids.has(c.parentId))
}

function categoryItem(c: NavCategory, categories: NavCategory[], withChildren: boolean): MenuItem {
  const children = withChildren
    ? categories.filter((k) => k.parentId === c._id).map((k) => ({ label: k.title, href: categoryHref(k), icon: k.icon }))
    : []
  return { label: c.title, href: categoryHref(c), icon: c.icon, ...(children.length ? { children } : {}) }
}

/** One saved link (custom address, built-in page or category) → a MenuItem, or null if it points nowhere. */
function resolveLink(entry: LinkEntry, categories: NavCategory[], withChildren = false): MenuItem | null {
  if (entry._type === 'navLink') {
    return entry.label && entry.href ? { label: entry.label, href: entry.href, newTab: entry.newTab } : null
  }
  if (entry._type === 'pageLink') {
    return entry.page ? { label: entry.label?.trim() || pageLabel(entry.page), href: entry.page } : null
  }
  const category = categories.find((c) => c._id === entry.categoryId)
  if (!category) return null
  const item = categoryItem(category, categories, withChildren)
  return entry.label?.trim() ? { ...item, label: entry.label.trim() } : item
}

// ── Header ──────────────────────────────────────────────────────────────────

/**
 * The header menu. With nothing saved it is every top-level category (sub-categories
 * as a drop-down). Saved items replace that, in the saved order; the
 * "All categories (automatic)" item puts the whole automatic group back anywhere in the list.
 */
export function buildHeaderMenu(settings: SiteSettings, categories: NavCategory[]): MenuItem[] {
  const { modules, nav } = settings
  const blog = modules.blog
  const items: MenuItem[] = []

  if (nav.items.length) {
    for (const entry of nav.items) {
      if (entry._type === 'autoCategories') {
        if (!blog) continue
        const withChildren = entry.showSubcategories !== false
        for (const c of topLevel(categories)) items.push(categoryItem(c, categories, withChildren))
      } else {
        const item = resolveLink(entry, categories, true)
        if (item) items.push(item)
      }
    }
    return items
  }

  if (blog) for (const c of topLevel(categories)) items.push(categoryItem(c, categories, true))
  if (modules.offers) items.push({ label: 'Offers', href: '/offers' })
  // A brand-new site has no categories yet: keep the bar useful.
  if (!items.length) {
    if (blog) items.push({ label: 'Articles', href: '/blog' })
    items.push({ label: 'About', href: '/about' })
  }
  return items
}

/** Splits the menu into what fits in the bar and what moves under "More". */
export function splitMenu(items: MenuItem[], maxVisible: number): { visible: MenuItem[]; more: MenuItem[] } {
  const max = Math.max(3, maxVisible || 6)
  // Only collapse when it saves at least two entries ("More" itself takes a slot).
  if (items.length <= max + 1) return { visible: items, more: [] }
  return { visible: items.slice(0, max), more: items.slice(max) }
}

// ── Footer ──────────────────────────────────────────────────────────────────

export interface FooterColumn {
  title: string
  links: MenuItem[]
}

function defaultQuickLinks(settings: SiteSettings): MenuItem[] {
  const links: MenuItem[] = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]
  if (settings.modules.affiliate || settings.modules.offers) links.push({ label: 'Affiliate Disclosure', href: '/disclosure' })
  links.push({ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Use', href: '/terms' })
  return links
}

function defaultContactLinks(settings: SiteSettings): MenuItem[] {
  const links: MenuItem[] = [{ label: 'Get in touch →', href: '/contact' }]
  if (settings.contactEmail) links.push({ label: settings.contactEmail, href: `mailto:${settings.contactEmail}` })
  return links
}

/**
 * Footer link columns. With nothing saved: Categories, Quick Links, Contact.
 * Otherwise exactly the columns the editor built, in their order.
 */
export function buildFooterColumns(settings: SiteSettings, categories: NavCategory[]): FooterColumn[] {
  const top = topLevel(categories)
  const showCategories = settings.modules.blog

  if (!settings.footer.columns.length) {
    const columns: FooterColumn[] = []
    if (showCategories && top.length) {
      columns.push({ title: 'Categories', links: top.slice(0, 8).map((c) => ({ label: c.title, href: categoryHref(c), icon: c.icon })) })
    }
    columns.push({ title: 'Quick Links', links: defaultQuickLinks(settings) })
    columns.push({ title: 'Contact', links: defaultContactLinks(settings) })
    return columns
  }

  const columns: FooterColumn[] = []
  for (const col of settings.footer.columns.slice(0, 4)) {
    if (col._type === 'footerCategoriesColumn') {
      if (!showCategories || !top.length) continue
      const limit = Math.min(12, Math.max(2, col.limit ?? 8))
      const showIcons = col.showIcons !== false
      columns.push({
        title: col.title?.trim() || 'Categories',
        links: top.slice(0, limit).map((c) => ({ label: c.title, href: categoryHref(c), ...(showIcons ? { icon: c.icon } : {}) })),
      })
    } else {
      const links = (col.links ?? []).map((l) => resolveLink(l, categories)).filter((l): l is MenuItem => l !== null)
      if (links.length) columns.push({ title: col.title?.trim() || 'Links', links })
    }
  }
  return columns
}

// ── Social ──────────────────────────────────────────────────────────────────

export function socialLinks(settings: SiteSettings): { key: string; label: string; href: string }[] {
  const labels: Record<string, string> = {
    x: 'X',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
  }
  return Object.entries(settings.social)
    .filter(([, href]) => Boolean(href))
    .map(([key, href]) => ({ key, label: labels[key] ?? key, href: href as string }))
}
