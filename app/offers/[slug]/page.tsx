import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, X } from 'lucide-react'
import AffiliateDisclosure from '@/components/blog/AffiliateDisclosure'
import PortableText from '@/components/blog/PortableText'
import { offerHref } from '@/components/offers/OfferCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import SanityImage from '@/components/ui/SanityImage'
import Stars from '@/components/ui/Stars'
import { AFFILIATE_REL, isExternal } from '@/lib/affiliates'
import { getCountry } from '@/lib/country'
import { formatDate } from '@/lib/format'
import { collectFaqs, getHeadings } from '@/lib/headings'
import { breadcrumbSchema, faqSchema, offerReviewSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { hasImage } from '@/sanity/image'
import { getOfferBySlug, getOffersForSitemap } from '@/sanity/queries'

export const revalidate = false

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  try {
    return (await getOffersForSitemap()).map((o) => ({ slug: o.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const [settings, offer] = await Promise.all([getSettings(), getOfferBySlug(slug)])
  if (!settings.modules.offers || !offer) return {}
  return buildMetadata({
    settings,
    title: offer.seoTitle || `${offer.name} review${offer.tagline ? `: ${offer.tagline}` : ''}`,
    description: offer.seoDescription || offer.summary || offer.tagline,
    path: `/offers/${offer.slug}`,
    image: offer.logo,
    noIndex: offer.noIndex,
  })
}

export default async function OfferPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const [settings, offer] = await Promise.all([getSettings(), getOfferBySlug(slug)])
  if (!settings.modules.offers || !offer) notFound()

  const country = getCountry(settings.country)
  const href = offerHref(offer, settings)
  const external = isExternal(href)
  const body = offer.body ?? []
  const headings = getHeadings(body)
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Offers', path: '/offers' }, { name: offer.name, path: `/offers/${offer.slug}` }]

  const facts: [string, string | undefined][] = [
    ['Starting price', offer.startingPrice],
    ['Pricing', offer.pricingModel ? { free: 'Free', freemium: 'Free plan available', paid: 'Paid', 'one-time': 'One-time payment' }[offer.pricingModel] ?? offer.pricingModel : undefined],
    ['Best for', offer.bestFor],
    ['Trial / guarantee', offer.freeTrial],
  ]

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <JsonLd data={[offerReviewSchema(offer, settings), faqSchema(collectFaqs(body)), breadcrumbSchema(crumbs)]} />
      <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c))} />

      <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
        <article className="min-w-0 max-w-3xl">
          <header className="flex items-start gap-4 sm:gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-surface-border overflow-hidden shrink-0">
              {hasImage(offer.logo) ? (
                <SanityImage image={offer.logo} alt={offer.logo?.alt || `${offer.name} logo`} priority sizes="96px" className="!object-contain p-2" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-heading font-extrabold text-3xl text-brand-primary">{offer.name.slice(0, 1)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight text-text-primary text-balance">{offer.name} review</h1>
              {offer.tagline && <p className="mt-2 text-lg text-text-muted">{offer.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                <Stars rating={offer.rating} />
                {offer.category && <Link href={`/category/${offer.category.slug}`} className="hover:text-brand-primary">{offer.category.title}</Link>}
                {offer.updatedAt && <span>Updated {formatDate(offer.updatedAt, country)}</span>}
              </div>
            </div>
          </header>

          <AffiliateDisclosure settings={settings} />

          {offer.summary && <p className="text-lg leading-relaxed text-text-primary/90 mb-8">{offer.summary}</p>}

          {(offer.pros?.length || offer.cons?.length) ? (
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {!!offer.pros?.length && (
                <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-4">
                  <p className="text-emerald-800 font-bold text-sm mb-2.5">Pros</p>
                  <ul className="space-y-2 text-sm text-stone-800">
                    {offer.pros.map((p, i) => <li key={i} className="flex items-start gap-2"><Check size={16} className="text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />{p}</li>)}
                  </ul>
                </div>
              )}
              {!!offer.cons?.length && (
                <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-4">
                  <p className="text-rose-800 font-bold text-sm mb-2.5">Cons</p>
                  <ul className="space-y-2 text-sm text-stone-800">
                    {offer.cons.map((c, i) => <li key={i} className="flex items-start gap-2"><X size={16} className="text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {!!offer.features?.length && (
            <section className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-text-primary mb-3">Key features</h2>
              <ul className="list-disc ps-6 space-y-2 marker:text-brand-primary text-[17px] text-text-primary/90">
                {offer.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </section>
          )}

          {body.length > 0 && (
            <div className="article-body">
              <PortableText value={body} settings={settings} headings={headings} />
            </div>
          )}
        </article>

        <aside aria-label="At a glance" className="lg:sticky lg:top-24 self-start">
          <div className="bg-surface-card border border-surface-border rounded-2xl shadow-card p-5">
            <h2 className="font-heading font-bold text-lg text-text-primary mb-3">At a glance</h2>
            <dl className="divide-y divide-surface-border text-sm">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="py-2.5 flex justify-between gap-4">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="font-semibold text-text-primary text-end">{v}</dd>
                </div>
              ))}
            </dl>
            {(offer.promoNote || offer.promoCode) && (
              <p className="mt-3 rounded-lg bg-accent/15 px-3 py-2 text-sm font-semibold text-text-primary">
                {offer.promoNote}
                {offer.promoCode && <> · Code <span className="font-mono">{offer.promoCode}</span></>}
              </p>
            )}
            {href && (
              <a href={href} {...(external ? { target: '_blank' } : {})} rel={AFFILIATE_REL} className="btn btn-accent w-full mt-4">
                Visit {offer.name}
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
