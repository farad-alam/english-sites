import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OfferCard from '@/components/offers/OfferCard'
import AffiliateDisclosure from '@/components/blog/AffiliateDisclosure'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import SectionHeading from '@/components/ui/SectionHeading'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { getOffers } from '@/sanity/queries'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  if (!settings.modules.offers) return {}
  return buildMetadata({
    settings,
    title: 'Best deals and offers',
    description: `Hand-picked software, hosting and digital products reviewed by ${settings.siteName}.`,
    path: '/offers',
  })
}

export default async function OffersPage() {
  const settings = await getSettings()
  if (!settings.modules.offers) notFound()
  const offers = await getOffers({ limit: 60 })

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Offers', path: '/offers' }])} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Offers' }]} />
      <div className="mt-6">
        <SectionHeading as="h1" title="Best deals and offers" subtitle="Hand-picked tools we have researched — with the current deals." />
      </div>
      <AffiliateDisclosure settings={settings} />
      {offers.length ? (
        <div className="space-y-4">
          {offers.map((o, i) => (
            <OfferCard key={o._id} offer={o} settings={settings} rank={i + 1} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-text-muted bg-surface-card rounded-2xl border border-surface-border">No offers yet — check back soon.</p>
      )}
    </div>
  )
}
