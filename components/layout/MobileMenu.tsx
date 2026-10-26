'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Search, X } from 'lucide-react'
import type { MenuItem } from '@/lib/nav'

interface Props {
  items: MenuItem[]
  ctaLabel?: string
  ctaHref?: string
  showSearch: boolean
}

function Entry({ item, onNavigate, child }: { item: MenuItem; onNavigate: () => void; child?: boolean }) {
  const external = /^https?:\/\//i.test(item.href) || item.href.startsWith('mailto:')
  const className = child
    ? 'flex items-center min-h-[44px] ps-8 pe-3 rounded-lg text-[15px] text-text-muted hover:bg-surface-hover hover:text-text-primary'
    : 'flex items-center min-h-[48px] px-3 rounded-lg text-[17px] font-medium text-text-primary hover:bg-surface-hover'
  const props = {
    onClick: onNavigate,
    className,
    ...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  }
  return external || item.newTab ? (
    <a href={item.href} {...props}>
      {item.label}
    </a>
  ) : (
    <Link href={item.href} {...props}>
      {item.label}
    </Link>
  )
}

export default function MobileMenu({ items, ctaLabel, ctaHref, showSearch }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="w-11 h-11 -me-2 inline-flex items-center justify-center rounded-lg text-text-primary active:bg-surface-hover"
      >
        <Menu size={24} />
      </button>

      {/* Rendered on <body>: the header's backdrop blur would otherwise pin "fixed" to the header strip. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Menu">
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 w-full h-full bg-black/40 animate-fade-in cursor-default"
            />
            <div className="absolute inset-y-0 end-0 w-[min(88vw,22rem)] bg-surface-base shadow-lg-light flex flex-col animate-fade-in">
              <div className="flex items-center justify-between h-16 px-4 border-b border-surface-border">
                <span className="font-heading font-bold text-text-primary">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="w-11 h-11 -me-2 inline-flex items-center justify-center rounded-lg active:bg-surface-hover"
                >
                  <X size={22} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
                {showSearch && (
                  <Link
                    href="/search"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 min-h-[48px] px-3 rounded-lg text-text-primary hover:bg-surface-hover"
                  >
                    <Search size={18} /> Search
                  </Link>
                )}
                {items.map((item) => (
                  <div key={`${item.href}-${item.label}`}>
                    <Entry item={item} onNavigate={() => setOpen(false)} />
                    {item.children?.map((c) => (
                      <Entry key={c.href} item={c} child onNavigate={() => setOpen(false)} />
                    ))}
                  </div>
                ))}
              </nav>
              {ctaLabel && ctaHref && (
                <div className="p-4 border-t border-surface-border">
                  <Link href={ctaHref} onClick={() => setOpen(false)} className="btn btn-accent w-full">
                    {ctaLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
