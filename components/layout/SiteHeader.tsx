import Link from 'next/link'
import { ChevronDown, Search } from 'lucide-react'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import { buildHeaderMenu, splitMenu, type MenuItem } from '@/lib/nav'
import type { NavCategory, SiteSettings } from '@/sanity/types'

interface Props {
  settings: SiteSettings
  categories: NavCategory[]
}

const barLink =
  'inline-flex items-center gap-1 min-h-[44px] px-3 rounded-lg text-[15px] font-medium whitespace-nowrap text-text-primary/80 hover:text-brand-primary hover:bg-surface-hover transition-colors'

function ItemLink({ item, className }: { item: MenuItem; className: string }) {
  const external = /^https?:\/\//i.test(item.href) || item.href.startsWith('mailto:')
  return external || item.newTab ? (
    <a href={item.href} {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={className}>
      {item.label}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  )
}

/** A drop-down opens on hover or keyboard focus — no JavaScript needed. */
function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="invisible opacity-0 translate-y-1 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 absolute start-0 top-full pt-1.5 min-w-[13rem] z-50">
      <ul className="rounded-xl border border-surface-border bg-surface-card shadow-lg-light p-1.5">{children}</ul>
    </div>
  )
}

const panelLink = 'flex items-center min-h-[40px] px-3 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover hover:text-brand-primary'

function BarItem({ item }: { item: MenuItem }) {
  if (!item.children?.length) return <ItemLink item={item} className={barLink} />
  return (
    <div className="relative group">
      <Link href={item.href} className={barLink}>
        {item.label}
        <ChevronDown size={14} aria-hidden="true" className="opacity-60 transition-transform group-hover:rotate-180" />
      </Link>
      <DropdownPanel>
        {item.children.map((c) => (
          <li key={c.href}>
            <ItemLink item={c} className={panelLink} />
          </li>
        ))}
      </DropdownPanel>
    </div>
  )
}

function MoreItem({ items }: { items: MenuItem[] }) {
  return (
    <div className="relative group">
      <button type="button" aria-haspopup="true" className={barLink}>
        More
        <ChevronDown size={14} aria-hidden="true" className="opacity-60 transition-transform group-hover:rotate-180" />
      </button>
      <DropdownPanel>
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <ItemLink item={item} className={panelLink} />
          </li>
        ))}
      </DropdownPanel>
    </div>
  )
}

export default function SiteHeader({ settings, categories }: Props) {
  const items = buildHeaderMenu(settings, categories)
  const { visible, more } = splitMenu(items, settings.nav.maxVisible)
  const { ctaLabel, ctaHref } = settings.nav
  const showSearch = settings.modules.blog

  return (
    <header className="sticky top-0 z-50 h-16 bg-surface-base/95 backdrop-blur border-b border-surface-border">
      <div className="max-w-page mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        <Logo settings={settings} />

        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" aria-label="Main">
          {visible.map((item) => (
            <BarItem key={`${item.href}-${item.label}`} item={item} />
          ))}
          {more.length > 0 && <MoreItem items={more} />}
        </nav>

        <div className="hidden lg:flex items-center gap-0.5">
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
        </div>

        <MobileMenu items={items} ctaLabel={ctaLabel} ctaHref={ctaHref} showSearch={showSearch} />
      </div>
    </header>
  )
}
