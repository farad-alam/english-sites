'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import type { NavLink } from '@/sanity/types'

interface Props {
  links: NavLink[]
  ctaLabel?: string
  ctaHref?: string
  showSearch: boolean
}

export default function MobileMenu({ links, ctaLabel, ctaHref, showSearch }: Props) {
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
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="w-11 h-11 -me-2 inline-flex items-center justify-center rounded-lg text-text-primary active:bg-surface-hover"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 w-full h-full bg-black/40 animate-fade-in cursor-default" />
          <div className="absolute inset-y-0 end-0 w-[min(88vw,22rem)] bg-surface-base shadow-lg-light flex flex-col animate-fade-in">
            <div className="flex items-center justify-between h-16 px-4 border-b border-surface-border">
              <span className="font-heading font-bold text-text-primary">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="w-11 h-11 -me-2 inline-flex items-center justify-center rounded-lg active:bg-surface-hover">
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
              {showSearch && (
                <Link href="/search" onClick={() => setOpen(false)} className="flex items-center gap-3 min-h-[48px] px-3 rounded-lg text-text-primary hover:bg-surface-hover">
                  <Search size={18} /> Search
                </Link>
              )}
              {links.map((l) => (
                <Link
                  key={`${l.href}-${l.label}`}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  {...(l.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center min-h-[48px] px-3 rounded-lg text-[17px] font-medium text-text-primary hover:bg-surface-hover"
                >
                  {l.label}
                </Link>
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
        </div>
      )}
    </div>
  )
}
