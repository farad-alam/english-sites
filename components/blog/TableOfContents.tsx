'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { List, X } from 'lucide-react'

export interface TocItem {
  id: string
  text: string
  level: 'h2' | 'h3'
}

function useActiveHeading(items: TocItem[]) {
  const [activeId, setActiveId] = useState('')
  useEffect(() => {
    if (!items.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])
  return [activeId, setActiveId] as const
}

export default function TableOfContents({ items, variant }: { items: TocItem[]; variant: 'desktop' | 'mobile' }) {
  const [activeId, setActiveId] = useActiveHeading(items)
  if (items.length < 3) return null
  return variant === 'desktop' ? (
    <DesktopToc items={items} activeId={activeId} setActiveId={setActiveId} />
  ) : (
    <MobileToc items={items} activeId={activeId} setActiveId={setActiveId} />
  )
}

function DesktopToc({ items, activeId, setActiveId }: { items: TocItem[]; activeId: string; setActiveId: (id: string) => void }) {
  return (
    <nav aria-label="On this page" className="max-h-[calc(100vh-9rem)] overflow-y-auto pe-2">
      <p className="font-heading text-xs font-bold text-text-muted uppercase tracking-widest mb-3">On this page</p>
      <ol className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={`block text-sm leading-snug py-1.5 border-s-2 transition-colors ${item.level === 'h3' ? 'ps-6' : 'ps-3'} ${
                activeId === item.id
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-surface-border text-text-muted hover:text-text-primary hover:border-brand-primary/40'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function MobileToc({ items, activeId, setActiveId }: { items: TocItem[]; activeId: string; setActiveId: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    triggerRef.current = (e?.currentTarget as HTMLElement) ?? null
    setIsOpen(true)
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus?.()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close()
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close])

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveId(id)
    setIsOpen(false)
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    }, 60)
  }

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="w-full mb-8 flex items-center gap-3 min-h-[52px] px-4 bg-surface-card border border-surface-border rounded-xl text-start shadow-sm-light active:bg-surface-hover"
      >
        <List size={20} className="text-brand-primary shrink-0" />
        <span className="flex-1 font-heading text-sm font-semibold text-text-primary">
          On this page <span className="ms-1 text-xs font-normal text-text-muted">({items.length})</span>
        </span>
      </button>

      {showFab && !isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label="On this page"
          aria-haspopup="dialog"
          className="animate-fade-in fixed bottom-safe end-4 z-40 w-12 h-12 rounded-full bg-brand-primary text-on-primary shadow-lg-light flex items-center justify-center active:scale-95 transition-transform"
        >
          <List size={20} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <button type="button" aria-label="Close" tabIndex={-1} onClick={close} className="animate-fade-in absolute inset-0 w-full h-full bg-black/40 cursor-default" />
          <div ref={panelRef} role="dialog" aria-modal="true" aria-label="On this page" className="animate-sheet-up absolute inset-x-0 bottom-0 max-h-[75vh] flex flex-col bg-surface-base rounded-t-2xl shadow-lg-light">
            <div className="flex justify-center pt-2.5" aria-hidden="true"><span className="w-10 h-1 rounded-full bg-surface-border" /></div>
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-surface-border">
              <h2 className="font-heading font-bold text-text-primary text-base">On this page</h2>
              <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="shrink-0 w-11 h-11 -me-2 flex items-center justify-center rounded-full text-text-muted active:bg-surface-hover">
                <X size={20} />
              </button>
            </div>
            <nav aria-label="On this page" className="overflow-y-auto overscroll-contain px-3 pt-2 pb-safe">
              <ol>
                {items.map((item) => {
                  const active = activeId === item.id
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => goTo(e, item.id)}
                        aria-current={active ? 'true' : undefined}
                        className={`flex items-center min-h-[48px] py-2.5 pe-3 rounded-lg border-s-[3px] text-[15px] leading-snug ${
                          item.level === 'h3' ? 'ps-8 text-text-muted' : 'ps-4 font-medium text-text-primary'
                        } ${active ? 'border-brand-primary bg-brand-soft !text-brand-primary font-semibold' : 'border-transparent active:bg-surface-hover'}`}
                      >
                        {item.text}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
