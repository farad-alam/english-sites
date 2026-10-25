import type { NavLink, SiteSettings } from '@/sanity/types'

type NavCategory = { title: string; slug: string }

/** Header links: the editor's own menu if set, otherwise an automatic one. */
export function buildHeaderLinks(settings: SiteSettings, categories: NavCategory[]): NavLink[] {
  if (settings.nav.links.length) return settings.nav.links
  const links: NavLink[] = []
  if (settings.modules.blog && settings.nav.showCategories) {
    for (const c of categories.slice(0, 4)) links.push({ label: c.title, href: `/category/${c.slug}` })
  }
  if (settings.modules.blog && links.length === 0) links.push({ label: 'Articles', href: '/blog' })
  if (settings.modules.offers) links.push({ label: 'Offers', href: '/offers' })
  links.push({ label: 'About', href: '/about' })
  return links
}

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export function buildFooterColumns(settings: SiteSettings, categories: NavCategory[]): FooterColumn[] {
  if (settings.footer.columns.length) {
    return settings.footer.columns.map((c) => ({ title: c.title, links: c.links ?? [] }))
  }
  const columns: FooterColumn[] = []

  const explore: NavLink[] = []
  if (settings.modules.blog) {
    for (const c of categories.slice(0, 6)) explore.push({ label: c.title, href: `/category/${c.slug}` })
    explore.push({ label: 'All articles', href: '/blog' })
  }
  if (settings.modules.offers) explore.push({ label: 'Offers', href: '/offers' })
  if (explore.length) columns.push({ title: 'Explore', links: explore })

  const company: NavLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
  ]
  if (settings.modules.affiliate || settings.modules.offers) company.push({ label: 'Affiliate Disclosure', href: '/disclosure' })
  columns.push({ title: 'Company', links: company })

  return columns
}

export function socialLinks(settings: SiteSettings): { label: string; href: string }[] {
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
    .map(([key, href]) => ({ label: labels[key] ?? key, href: href as string }))
}
