import type { Metadata } from 'next'
import PortableText from '@/components/blog/PortableText'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/ui/JsonLd'
import { getCountry } from '@/lib/country'
import { formatDate } from '@/lib/format'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import type { SiteSettings, StaticPageData } from '@/sanity/types'

/**
 * A page the editor made with "Custom page" in Studio (for example "How we review"),
 * served at /<slug>. Same look as About / Privacy / Terms.
 */
export function customPageMetadata(page: StaticPageData, settings: SiteSettings): Metadata {
  return buildMetadata({
    settings,
    title: page.title,
    description: page.description || page.intro,
    path: `/${page.slug}`,
  })
}

export default function CustomPage({ page, settings }: { page: StaticPageData; settings: SiteSettings }) {
  const country = getCountry(settings.country)
  const path = `/${page.slug}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: page.title, path }])} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: page.title }]} />

      <header className="mt-6 mb-8 pb-8 border-b border-surface-border">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary text-balance">{page.title}</h1>
        {page.intro && <p className="mt-3 text-lg text-text-muted">{page.intro}</p>}
        {page.updatedAt && <p className="mt-3 text-xs text-text-muted">Last updated {formatDate(page.updatedAt, country)}</p>}
      </header>

      <div className="article-body">{page.body?.length ? <PortableText value={page.body} settings={settings} /> : null}</div>
    </div>
  )
}
