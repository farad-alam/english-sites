'use client'

import { useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

export interface ComparisonRow {
  key: string
  name: string
  verdictLabel?: string
  imageSrc?: string
  imageAlt?: string
  rating?: number
  price?: string
  pros?: string[]
  cons?: string[]
  href?: string
  external?: boolean
  ctaLabel: string
}

const rankClass = (n: number) =>
  n === 1 ? 'bg-amber-400 text-stone-950' : n === 2 ? 'bg-amber-300 text-stone-950' : n === 3 ? 'bg-amber-200 text-stone-950' : 'bg-brand-primary text-on-primary'

function Row({ p, rank }: { p: ComparisonRow; rank: number }) {
  const [open, setOpen] = useState(false)
  const hasDetails = Boolean(p.pros?.length || p.cons?.length)
  const score = typeof p.rating === 'number' ? p.rating.toFixed(1) : null

  const cta = p.href ? (
    <a
      href={p.href}
      {...(p.external ? { target: '_blank' } : {})}
      rel="noopener noreferrer nofollow sponsored"
      onClick={(e) => e.stopPropagation()}
      className="btn btn-accent !min-h-[40px] !py-2 !px-3.5 !text-[13px] whitespace-nowrap"
    >
      {p.ctaLabel}
    </a>
  ) : null

  const toggle = hasDetails ? (
    <button
      type="button"
      aria-expanded={open}
      aria-label={open ? `Hide details for ${p.name}` : `Show details for ${p.name}`}
      onClick={(e) => {
        e.stopPropagation()
        setOpen((o) => !o)
      }}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover shrink-0"
    >
      <ChevronDown size={18} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
  ) : null

  const thumb = p.imageSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.imageSrc} alt={p.imageAlt || p.name} loading="lazy" decoding="async" className="w-full h-full object-contain" />
  ) : null

  return (
    <div className="border-b border-surface-border/70 last:border-b-0">
      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-[56px_minmax(0,1fr)_80px_96px_auto] items-center gap-3 px-5 py-4">
        <span className={`inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-lg text-sm font-black ${rankClass(rank)}`}>#{rank}</span>
        <div className="flex items-center gap-3.5 min-w-0">
          {thumb && <div className="w-14 h-14 shrink-0 rounded-lg bg-white p-1 border border-surface-border">{thumb}</div>}
          <div className="min-w-0">
            {p.verdictLabel && <span className="inline-block bg-brand-soft text-brand-primary text-[11px] font-semibold px-2 py-0.5 rounded-full mb-0.5">{p.verdictLabel}</span>}
            <h4 className="font-heading font-bold text-text-primary text-[15px] leading-snug line-clamp-2">{p.name}</h4>
          </div>
        </div>
        <div className="text-center font-bold text-[15px] text-text-primary">{score ? <><span className="text-amber-500">★</span> {score}</> : <span className="text-text-muted">—</span>}</div>
        <div className="text-center text-sm text-text-primary">{p.price ?? <span className="text-text-muted">—</span>}</div>
        <div className="flex items-center justify-end gap-1.5">{cta}{toggle}</div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`inline-flex items-center justify-center min-w-[34px] h-7 px-2 rounded-md text-xs font-black ${rankClass(rank)}`}>#{rank}</span>
            {p.verdictLabel && <span className="bg-brand-soft text-brand-primary text-[10px] font-semibold px-2 py-0.5 rounded-full truncate">{p.verdictLabel}</span>}
          </div>
          {score && <span className="font-bold text-xs text-text-primary"><span className="text-amber-500">★</span> {score}</span>}
        </div>
        <div className="flex items-center gap-3 mb-3">
          {thumb && <div className="w-12 h-12 shrink-0 rounded-lg bg-white p-1 border border-surface-border">{thumb}</div>}
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-text-primary text-sm leading-snug line-clamp-2">{p.name}</h4>
            {p.price && <p className="text-xs text-text-muted mt-0.5">{p.price}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 [&>a]:w-full">{cta}</div>
          {toggle}
        </div>
      </div>

      {/* Details stay in the DOM (hidden) so search engines can read them */}
      {hasDetails && (
        <div className={`border-t border-surface-border/70 bg-surface-raised px-4 sm:px-6 py-4 ${open ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!!p.pros?.length && (
              <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3.5">
                <p className="text-emerald-800 font-bold text-xs mb-2">Pros</p>
                <ul className="space-y-1.5 text-xs text-stone-800">
                  {p.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check size={13} className="text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />{pro}</li>
                  ))}
                </ul>
              </div>
            )}
            {!!p.cons?.length && (
              <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-3.5">
                <p className="text-rose-800 font-bold text-xs mb-2">Cons</p>
                <ul className="space-y-1.5 text-xs text-stone-800">
                  {p.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5"><X size={13} className="text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />{con}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductComparisonTable({ heading, rows }: { heading?: string; rows: ComparisonRow[] }) {
  if (!rows.length) return null
  return (
    <div className="my-8 md:my-12">
      <div className="mb-4">
        <span className="text-[12px] font-bold uppercase tracking-wider text-brand-primary block mb-1">Ranked</span>
        <h3 className="font-heading font-extrabold text-text-primary text-xl sm:text-2xl md:text-3xl tracking-tight">{heading || 'Our top picks'}</h3>
      </div>
      <div className="bg-surface-card rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[56px_minmax(0,1fr)_80px_96px_auto] gap-3 bg-surface-raised border-b border-surface-border px-5 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
          <span className="text-center">Rank</span>
          <span>Product</span>
          <span className="text-center">Score</span>
          <span className="text-center">Price</span>
          <span className="text-end pe-1">Deal</span>
        </div>
        {rows.map((p, i) => (
          <Row key={p.key} p={p} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
