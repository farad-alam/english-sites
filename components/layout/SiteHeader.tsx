import Link from 'next/link'
import { Search } from 'lucide-react'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import { buildHeaderLinks } from '@/lib/nav'
import type { NavLink, SiteSettings } from '@/sanity/types'

interface Props {
  settings: SiteSettings
  categories: { title: string; slug: string }[]
}

export default function SiteHeader({ settings, categories }: Props) {
  const links: NavLink[] = buildHeaderLinks(settings, categories)
  const { ctaLabel, ctaHref } = settings.nav
  const showSearch = settings.modules.blog

  return (
    <header className="sticky top-0 z-50 h-16 bg-surface-base/95 backdrop-blur border-b border-surface-border">
      <div className="max-w-page mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        <Logo settings={settings} />

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-end" aria-label="Main">
          {links.map((l) => (
            <Link
              key={`${l.href}-${l.label}`}
              href={l.href}
              {...(l.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center min-h-[44px] px-3 rounded-lg text-[15px] font-medium text-text-primary/80 hover:text-brand-primary hover:bg-surface-hover transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {showSearch && (
            <Link href="/search" aria-label="Search" className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-text-primary/80 hover:text-brand-primary hover:bg-surface-hover transition-colors">
              <Search size={19} />
            </Link>
          )}
          {ctaLabel && ctaHref && (
            <Link href={ctaHref} className="btn btn-accent ms-2 !min-h-[40px] !py-2">
              {ctaLabel}
            </Link>
          )}
        </nav>

        <MobileMenu links={links} ctaLabel={ctaLabel} ctaHref={ctaHref} showSearch={showSearch} />
      </div>
    </header>
  )
}
