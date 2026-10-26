// Kept dependency-free: it is imported by the Sanity Studio schemas as well as the app.

/**
 * Built-in pages an editor can add to the menu or footer from a drop-down
 * (no need to type a path). `label` is the default text of the link.
 */
export const PAGE_LINKS = [
  { value: '/', label: 'Home' },
  { value: '/blog', label: 'All articles' },
  { value: '/about', label: 'About' },
  { value: '/contact', label: 'Contact' },
  { value: '/privacy', label: 'Privacy Policy' },
  { value: '/terms', label: 'Terms of Use' },
  { value: '/disclosure', label: 'Affiliate Disclosure' },
  { value: '/offers', label: 'Offers' },
  { value: '/authors', label: 'Authors' },
  { value: '/search', label: 'Search' },
] as const

export function pageLabel(path: string | undefined): string {
  return PAGE_LINKS.find((p) => p.value === path)?.label ?? path ?? ''
}
