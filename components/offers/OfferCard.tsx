import Link from 'next/link'
import { Check } from 'lucide-react'
import SanityImage from '@/components/ui/SanityImage'
import Stars from '@/components/ui/Stars'
import { AFFILIATE_REL, isExternal, resolveHref } from '@/lib/affiliates'
import { hasImage } from '@/sanity/image'
import type { OfferCardData, SiteSettings } from '@/sanity/types'

interface Props {
  offer: OfferCardData
  settings: SiteSettings
  rank?: number
  /** compact = in-article deal box */
  variant?: 'list' | 'compact'
}

export function offerHref(offer: OfferCardData, settings: SiteSettings): string | undefined {
  return resolveHref({ link: offer.link, url: offer.url }, settings)
}

export default function OfferCard({ offer, settings, rank, variant = 'list' }: Props) {
  const href = offerHref(offer, settings)
  const external = isExternal(href)
  const logo = hasImage(offer.logo)

  return (
    <article className="bg-surface-card border border-surface-border rounded-2xl shadow-card overflow-hidden">
      <div className={`flex flex-col ${variant === 'list' ? 'md:flex-row md:items-center' : 'sm:flex-row sm:items-center'} gap-4 md:gap-6 p-4 sm:p-5`}>
        <div className="flex items-center gap-4 md:w-72 shrink-0">
          {typeof rank === 'number' && (
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-on-primary font-extrabold text-sm shrink-0" aria-label={`Rank ${rank}`}>
              {rank}
            </span>
          )}
          <div className="relative w-16 h-16 rounded-xl bg-white border border-surface-border overflow-hidden shrink-0">
            {logo ? (
              <SanityImage image={offer.logo} alt={offer.logo?.alt || `${offer.name} logo`} sizes="64px" className="!object-contain p-1.5" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-heading font-extrabold text-xl text-brand-primary">{offer.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-lg leading-tight text-text-primary">
              <Link href={`/offers/${offer.slug}`} className="hover:text-brand-primary">{offer.name}</Link>
            </h3>
            <Stars rating={offer.rating} className="mt-1" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 text-sm">
          {offer.tagline && <p className="text-text-primary/90">{offer.tagline}</p>}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-text-muted">
            {offer.startingPrice && <li><span className="font-semibold text-text-primary">From</span> {offer.startingPrice}</li>}
            {offer.bestFor && <li><span className="font-semibold text-text-primary">Best for</span> {offer.bestFor}</li>}
            {offer.freeTrial && (
              <li className="inline-flex items-center gap-1"><Check size={14} className="text-state-success" aria-hidden="true" />{offer.freeTrial}</li>
            )}
          </ul>
          {(offer.promoNote || offer.promoCode) && (
            <p className="inline-block rounded-md bg-accent/15 text-text-primary px-2.5 py-1 text-xs font-semibold">
              {offer.promoNote}
              {offer.promoCode && <> · Code <span className="font-mono">{offer.promoCode}</span></>}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:w-44 shrink-0">
          {href && (
            <a
              href={href}
              {...(external ? { target: '_blank', rel: AFFILIATE_REL } : { rel: 'sponsored nofollow' })}
              className="btn btn-accent w-full"
            >
              Visit {offer.name.length > 14 ? 'site' : offer.name}
            </a>
          )}
          <Link href={`/offers/${offer.slug}`} className="btn btn-outline w-full !min-h-[40px] !py-2 text-sm">
            Read review
          </Link>
        </div>
      </div>
    </article>
  )
}
