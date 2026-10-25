import OfferCard from '@/components/offers/OfferCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { getOffers, getOffersByIds } from '@/sanity/queries'
import type { SiteSettings, TopOffersSection } from '@/sanity/types'

export default async function TopOffers({ section, settings }: { section: TopOffersSection; settings: SiteSettings }) {
  const offers = section.offerIds?.length ? await getOffersByIds(section.offerIds) : await getOffers({ limit: section.count ?? 4 })
  if (!offers.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Top deals'} subtitle={section.subtitle} href="/offers" linkLabel="All offers" />
        <div className="space-y-4">
          {offers.map((o, i) => (
            <OfferCard key={o._id} offer={o} settings={settings} rank={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
