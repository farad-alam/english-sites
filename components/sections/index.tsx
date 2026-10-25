import type { ReactNode } from 'react'
import CategoryGrid from './CategoryGrid'
import CategoryShelves from './CategoryShelves'
import Cta from './Cta'
import Faq from './Faq'
import FeaturedPosts from './FeaturedPosts'
import Hero from './Hero'
import LatestPosts from './LatestPosts'
import RichText from './RichText'
import TopOffers from './TopOffers'
import TopPicks from './TopPicks'
import Trust from './Trust'
import type { HomeSection, ModuleName, SiteSettings } from '@/sanity/types'

/**
 * SECTION REGISTRY — maps a Sanity section type to its component and to the
 * module it needs. A section whose module is switched off is skipped.
 * To add a section: schema in sanity/schemas/sections, component here, one line below.
 */
type Renderer = (section: never, settings: SiteSettings) => ReactNode

const REGISTRY: Record<HomeSection['_type'], { requires?: ModuleName; render: Renderer }> = {
  heroSection: { render: ((s, st) => <Hero section={s} settings={st} />) as Renderer },
  latestPostsSection: { requires: 'blog', render: ((s, st) => <LatestPosts section={s} settings={st} />) as Renderer },
  featuredPostsSection: { requires: 'blog', render: ((s, st) => <FeaturedPosts section={s} settings={st} />) as Renderer },
  categoryShelvesSection: { requires: 'blog', render: ((s, st) => <CategoryShelves section={s} settings={st} />) as Renderer },
  categoryGridSection: { requires: 'blog', render: ((s) => <CategoryGrid section={s} />) as Renderer },
  topPicksSection: { requires: 'affiliate', render: ((s) => <TopPicks section={s} />) as Renderer },
  topOffersSection: { requires: 'offers', render: ((s, st) => <TopOffers section={s} settings={st} />) as Renderer },
  faqSection: { render: ((s) => <Faq section={s} />) as Renderer },
  trustSection: { render: ((s, st) => <Trust section={s} settings={st} />) as Renderer },
  richTextSection: { render: ((s, st) => <RichText section={s} settings={st} />) as Renderer },
  ctaSection: { render: ((s) => <Cta section={s} />) as Renderer },
}

export default function SectionRenderer({ sections, settings }: { sections: HomeSection[]; settings: SiteSettings }) {
  return (
    <>
      {sections.map((section) => {
        const entry = REGISTRY[section._type]
        if (!entry) return null
        if ((section as { disabled?: boolean }).disabled) return null
        if (entry.requires && !settings.modules[entry.requires]) return null
        return <div key={section._key}>{entry.render(section as never, settings)}</div>
      })}
    </>
  )
}
