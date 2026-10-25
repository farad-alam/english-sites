import Link from 'next/link'
import SanityImage from '@/components/ui/SanityImage'
import SectionHeading from '@/components/ui/SectionHeading'
import Stars from '@/components/ui/Stars'
import { AFFILIATE_REL, isExternal } from '@/lib/affiliates'
import { hasImage } from '@/sanity/image'
import { getOffersByIds, getPostsByIds } from '@/sanity/queries'
import type { PickItem, TopPicksSection } from '@/sanity/types'

const BADGE_STYLES = [
  'bg-amber-400 text-stone-950',
  'bg-slate-300 text-stone-950',
  'bg-orange-300 text-stone-950',
]

/** Where a pick points: your review article, an offer page, a managed /go/ link, or a plain URL. */
function destination(item: PickItem, postSlugs: Map<string, string>, offerSlugs: Map<string, string>): string | undefined {
  if (item.postId && postSlugs.has(item.postId)) return `/${postSlugs.get(item.postId)}`
  if (item.offerId && offerSlugs.has(item.offerId)) return `/offers/${offerSlugs.get(item.offerId)}`
  if (item.linkSlug) return `/go/${item.linkSlug}`
  return item.url
}

export default async function TopPicks({ section }: { section: TopPicksSection }) {
  const items = section.items ?? []
  if (!items.length) return null

  const [posts, offers] = await Promise.all([
    getPostsByIds(items.map((i) => i.postId).filter((x): x is string => Boolean(x))),
    getOffersByIds(items.map((i) => i.offerId).filter((x): x is string => Boolean(x))),
  ])
  const postSlugs = new Map(posts.map((p) => [p._id, p.slug]))
  const offerSlugs = new Map(offers.map((o) => [o._id, o.slug]))

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Our top picks'} subtitle={section.subtitle} eyebrow="Tested & ranked" />
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const href = destination(item, postSlugs, offerSlugs)
            const isGo = href?.startsWith('/go/')
            const label = item.ctaLabel || (item.postId ? 'Read review' : 'View deal')
            return (
              <li key={item._key} className="bg-surface-card border border-surface-border rounded-2xl shadow-card overflow-hidden flex flex-col">
                <div className="relative aspect-[16/10] bg-surface-raised">
                  {hasImage(item.image) && <SanityImage image={item.image} alt={item.image?.alt || item.title || ''} sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw" />}
                  <span className={`absolute top-3 start-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold shadow ${BADGE_STYLES[i] ?? 'bg-brand-primary text-on-primary'}`}>
                    #{i + 1}{item.badge ? ` · ${item.badge}` : ''}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1 gap-2">
                  <h3 className="font-heading font-bold text-lg text-text-primary leading-snug">{item.title}</h3>
                  <Stars rating={item.rating} />
                  {item.summary && <p className="text-sm text-text-muted leading-relaxed flex-1">{item.summary}</p>}
                  {href && (
                    <div className="pt-3">
                      {isGo || isExternal(href) ? (
                        <a href={href} {...(isExternal(href) ? { target: '_blank' } : {})} rel={AFFILIATE_REL} className="btn btn-accent w-full">{label}</a>
                      ) : (
                        <Link href={href} className="btn btn-primary w-full">{label}</Link>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
