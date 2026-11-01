import Image from 'next/image'
import Link from 'next/link'
import { PortableText as SanityPortableText, type PortableTextComponents } from 'next-sanity'
import { Check, X } from 'lucide-react'
import OfferCard from '@/components/offers/OfferCard'
import ProductComparisonTable, { type ComparisonRow } from './ProductComparisonTable'
import SanityImage from '@/components/ui/SanityImage'
import ChartBlock from './ChartBlock'
import YouTubeEmbed from './YouTubeEmbed'
import Stars from '@/components/ui/Stars'
import { AFFILIATE_REL, defaultCtaLabel, isExternal, resolveHref } from '@/lib/affiliates'
import type { HeadingInfo } from '@/lib/headings'
import { hasImage, urlFor } from '@/sanity/image'
import type { AffiliateLinkData, OfferCardData, PortableTextBlock, SanityImageValue, SiteSettings } from '@/sanity/types'

// ── helpers ────────────────────────────────────────────────────────────────

/** Natural pixel size from a Sanity asset id ("image-<hash>-1200x800-jpg"), adjusted for editor crop. */
function imageSize(image: SanityImageValue): { width: number; height: number } | null {
  const m = image.asset?._ref?.match(/-(\d+)x(\d+)-/)
  if (!m) return null
  let w = Number(m[1])
  let h = Number(m[2])
  if (image.crop) {
    w *= 1 - (image.crop.left ?? 0) - (image.crop.right ?? 0)
    h *= 1 - (image.crop.top ?? 0) - (image.crop.bottom ?? 0)
  }
  const maxW = 1200
  if (w > maxW) {
    h = (h * maxW) / w
    w = maxW
  }
  return { width: Math.round(w), height: Math.round(h) }
}

interface ProductLike {
  _key?: string
  name?: string
  badge?: string
  verdict?: string
  image?: SanityImageValue
  imageUrl?: string
  rating?: number
  price?: string
  description?: string
  pros?: string[]
  cons?: string[]
  link?: Partial<AffiliateLinkData> | null
  asin?: string
  url?: string
  ctaLabel?: string
}

const VERDICT_LABELS: Record<string, string> = {
  'best-overall': 'Best overall',
  'best-budget': 'Best budget',
  'best-premium': 'Best premium',
  'editors-choice': 'Editor’s choice',
}

function productImageSrc(p: ProductLike): { src?: string; alt: string } {
  if (hasImage(p.image)) return { src: urlFor(p.image!).width(240).height(240).fit('max').auto('format').url(), alt: p.image?.alt || p.name || '' }
  return { src: p.imageUrl?.replace(/^http:\/\//, 'https://'), alt: p.name || '' }
}

// ── custom blocks ──────────────────────────────────────────────────────────

function ProductCardBlock({ value, settings }: { value: ProductLike; settings: SiteSettings }) {
  if (!value?.name) return null
  const href = resolveHref(value, settings)
  const { src, alt } = productImageSrc(value)
  const label = value.ctaLabel || defaultCtaLabel(value.asin, value.link?.kind)
  return (
    <div className="my-7 md:my-8 bg-surface-card rounded-xl border border-surface-border overflow-hidden shadow-card">
      <div className={`grid ${src ? 'grid-cols-[104px_minmax(0,1fr)] sm:grid-cols-[200px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {src && (
          <div className="bg-white flex items-center justify-center p-2.5 sm:p-4 border-e border-surface-border sm:row-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-auto max-h-28 sm:max-h-56 object-contain" />
          </div>
        )}
        <div className="p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5 min-w-0">
          {value.badge && <span className="inline-block bg-accent/20 text-text-primary text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full w-fit">{value.badge}</span>}
          <h3 className="font-heading font-bold text-text-primary text-[15px] sm:text-lg leading-snug break-words">{value.name}</h3>
          <Stars rating={value.rating} />
          {value.description && <p className="text-sm text-text-muted leading-relaxed hidden sm:block">{value.description}</p>}
          {value.price && <p className="text-text-primary font-bold text-lg sm:text-xl">{value.price}</p>}
        </div>
        {href && (
          <div className={`${src ? 'col-span-2 sm:col-span-1 sm:col-start-2' : ''} px-3 pb-3 sm:px-5 sm:pb-5`}>
            <a href={href} {...(isExternal(href) ? { target: '_blank' } : {})} rel={AFFILIATE_REL} className="btn btn-accent w-full sm:w-auto">
              {label}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function ComparisonBlock({ value, settings }: { value: { heading?: string; products?: ProductLike[] }; settings: SiteSettings }) {
  const products = value?.products ?? []
  if (!products.length) return null
  const rows: ComparisonRow[] = products
    .filter((p) => p?.name)
    .map((p, i) => {
      const href = resolveHref(p, settings)
      const { src, alt } = productImageSrc(p)
      return {
        key: p._key ?? String(i),
        name: p.name!,
        verdictLabel: p.verdict ? (VERDICT_LABELS[p.verdict] ?? p.verdict) : undefined,
        imageSrc: src,
        imageAlt: alt,
        rating: p.rating,
        price: p.price,
        pros: p.pros,
        cons: p.cons,
        href,
        external: isExternal(href),
        ctaLabel: p.ctaLabel || (p.asin || p.link?.kind === 'amazon' ? 'See at Amazon' : 'View deal'),
      }
    })
  return <ProductComparisonTable heading={value.heading} rows={rows} />
}

function FaqBlock({ value }: { value: { items?: { _key?: string; question: string; answer: string }[] } }) {
  if (!value?.items?.length) return null
  return (
    <div className="my-8 md:my-10">
      <h3 className="font-heading font-bold text-text-primary text-xl mb-4">Frequently asked questions</h3>
      <div className="space-y-3">
        {value.items.map((item, i) => (
          <details key={item._key ?? i} className="bg-surface-card border border-surface-border rounded-xl group open:shadow-card open:border-brand-primary/30">
            <summary className="px-4 sm:px-5 py-3.5 min-h-[52px] cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 select-none">
              <span className="font-heading font-semibold text-text-primary text-[15px] sm:text-base leading-snug">{item.question}</span>
              <svg className="text-brand-primary shrink-0 transition-transform duration-200 group-open:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-text-primary/85 text-[15px] leading-[1.75] border-t border-surface-border/60 pt-3.5">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  )
}

function ProsCons({ value }: { value: { pros?: string[]; cons?: string[] } }) {
  if (!value?.pros?.length && !value?.cons?.length) return null
  return (
    <div className="my-7 md:my-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {!!value.pros?.length && (
        <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-4">
          <p className="text-emerald-800 font-bold text-sm mb-2.5">Pros</p>
          <ul className="space-y-2 text-sm text-stone-800">
            {value.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2"><Check size={16} className="text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />{p}</li>
            ))}
          </ul>
        </div>
      )}
      {!!value.cons?.length && (
        <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-4">
          <p className="text-rose-800 font-bold text-sm mb-2.5">Cons</p>
          <ul className="space-y-2 text-sm text-stone-800">
            {value.cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2"><X size={16} className="text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const CALLOUT: Record<string, { box: string; label: string }> = {
  tip: { box: 'border-emerald-500/30 bg-emerald-500/5', label: 'Tip' },
  info: { box: 'border-sky-500/30 bg-sky-500/5', label: 'Note' },
  warning: { box: 'border-amber-500/40 bg-amber-500/10', label: 'Heads up' },
  important: { box: 'border-red-500/30 bg-red-500/5', label: 'Important' },
}

// ── component map ──────────────────────────────────────────────────────────

export function createComponents(settings: SiteSettings, headings: HeadingInfo[]): PortableTextComponents {
  const idByKey = new Map(headings.map((h) => [h.key, h.id]))

  return {
    block: {
      h2: ({ children, value }) => (
        <h2 id={idByKey.get(value._key ?? "")} className="font-heading font-extrabold text-text-primary mt-10 md:mt-12 mb-3 md:mb-4 leading-snug scroll-mt-24 text-[24px] sm:text-[28px] text-balance">
          {children}
        </h2>
      ),
      h3: ({ children, value }) => (
        <h3 id={idByKey.get(value._key ?? "")} className="font-heading font-bold text-text-primary mt-8 md:mt-10 mb-2 md:mb-3 leading-snug scroll-mt-24 text-[20px] sm:text-[22px] text-balance">
          {children}
        </h3>
      ),
      h4: ({ children }) => <h4 className="font-heading font-bold text-text-primary mt-6 mb-2 text-[17px] md:text-lg">{children}</h4>,
      normal: ({ children }) => <p className="text-text-primary/90 leading-[1.75] text-[17px] md:text-[18px] mb-5 md:mb-6">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="border-s-4 border-brand-primary/60 bg-surface-card rounded-e-lg ps-4 pe-3 py-3 my-6 md:my-8 italic text-text-primary/80 text-base md:text-lg leading-[1.75]">{children}</blockquote>
      ),
    },

    list: {
      bullet: ({ children }) => <ul className="text-text-primary/90 text-[17px] md:text-[18px] list-disc list-outside marker:text-brand-primary space-y-2.5 mb-6 ps-6">{children}</ul>,
      number: ({ children }) => <ol className="text-text-primary/90 text-[17px] md:text-[18px] list-decimal list-outside marker:text-brand-primary marker:font-semibold space-y-2.5 mb-6 ps-6">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="leading-[1.75] ps-1">{children}</li>,
      number: ({ children }) => <li className="leading-[1.75] ps-1">{children}</li>,
    },

    marks: {
      strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <u>{children}</u>,
      link: ({ children, value }) => {
        const href: string = value?.href ?? '#'
        const cls = 'text-brand-primary underline decoration-brand-primary/30 hover:decoration-brand-primary underline-offset-4 transition-colors break-words'
        const newTab = value?.blank !== false && !/^(#|mailto:|tel:)/.test(href)
        const flagged = Boolean(value?.sponsored || value?.nofollow)
        const rel = [
          value?.sponsored ? 'sponsored nofollow noopener' : value?.nofollow ? 'nofollow noopener noreferrer' : '',
        ].filter(Boolean).join(' ')
        if (href.startsWith('/') && !flagged) {
          return <Link href={href} target={newTab ? '_blank' : undefined} className={cls}>{children}</Link>
        }
        return (
          <a href={href} target={newTab ? '_blank' : undefined} rel={rel || undefined} className={cls}>
            {children}
          </a>
        )
      },
    },

    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null
        const size = imageSize(value)
        return (
          <figure className="my-7 md:my-8">
            {size ? (
              <Image
                src={urlFor(value).url()}
                alt={value.alt ?? ''}
                width={size.width}
                height={size.height}
                sizes="(min-width: 768px) 720px, 100vw"
                className="w-full h-auto rounded-xl border border-surface-border"
              />
            ) : (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-border">
                <SanityImage image={value} alt={value.alt ?? ''} sizes="(min-width: 768px) 720px, 100vw" />
              </div>
            )}
            {value.caption && <figcaption className="text-text-muted text-xs md:text-sm text-center mt-2.5">{value.caption}</figcaption>}
          </figure>
        )
      },
      productCard: ({ value }) => <ProductCardBlock value={value} settings={settings} />,
      productComparisonTable: ({ value }) => <ComparisonBlock value={value} settings={settings} />,
      offerCard: ({ value }) => {
        const offer = value?.offer as OfferCardData | undefined
        if (!offer?.slug) return null
        return (
          <div className="my-7 md:my-8">
            <OfferCard offer={offer} settings={settings} variant="compact" />
          </div>
        )
      },
      faqBlock: ({ value }) => <FaqBlock value={value} />,
      prosConsBlock: ({ value }) => <ProsCons value={value} />,
      calloutBlock: ({ value }) => {
        if (!value?.text) return null
        const s = CALLOUT[value.type ?? 'info'] ?? CALLOUT.info
        return (
          <div className={`my-7 md:my-8 p-4 rounded-xl border ${s.box}`}>
            <p className="text-text-primary/90 text-[15px] leading-[1.75]">
              <strong className="me-1.5">{s.label}:</strong>
              {value.text}
            </p>
          </div>
        )
      },
      tableBlock: ({ value }) => {
        const rows: { _key?: string; cells?: string[] }[] = Array.isArray(value?.rows) ? value.rows : []
        if (!rows.length) return null
        const hasHeader = value?.firstRowHeader !== false
        const head = hasHeader ? rows[0] : null
        const body = hasHeader ? rows.slice(1) : rows
        return (
          <figure className="my-7 md:my-8">
            <div
              className="overflow-x-auto rounded-xl border border-surface-border"
              role="region"
              aria-label={value?.caption || 'Table'}
              tabIndex={0}
            >
              <table className="w-full min-w-[32rem] border-collapse text-left text-[15px] leading-snug">
                {head && (
                  <thead className="bg-surface-raised">
                    <tr>
                      {(head.cells || []).map((c, i) => (
                        <th key={i} scope="col" className="px-4 py-3 font-semibold text-text-primary border-b border-surface-border whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {body.map((r, ri) => (
                    <tr key={r._key || ri} className="even:bg-surface-raised/40">
                      {(r.cells || []).map((c, i) => (
                        <td key={i} className="px-4 py-3 align-top text-text-primary/90 border-b border-surface-border">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {value?.caption && <figcaption className="mt-2 text-sm text-text-muted">{value.caption}</figcaption>}
          </figure>
        )
      },
      youtubeEmbed: ({ value }) => (value?.url ? <YouTubeEmbed url={value.url} title={value.title} /> : null),
      chartBlock: ({ value }) => <ChartBlock value={value} />,
      checklistBlock: ({ value }) => {
        const items: string[] = Array.isArray(value?.items) ? value.items.filter(Boolean) : []
        if (!items.length) return null
        return (
          <div className="my-7 md:my-8 p-5 rounded-xl border border-surface-border bg-surface-raised">
            {value?.title && <p className="font-heading font-bold text-text-primary mb-3">{value.title}</p>}
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-text-primary/90 text-[16px] leading-[1.7]">
                  <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      },
    },
  }
}

export default function PortableText({ value, settings, headings = [] }: { value: PortableTextBlock[]; settings: SiteSettings; headings?: HeadingInfo[] }) {
  return <SanityPortableText value={value as never} components={createComponents(settings, headings)} />
}
