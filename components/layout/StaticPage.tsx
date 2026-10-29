import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import PortableText from '@/components/blog/PortableText'
import JsonLd from '@/components/ui/JsonLd'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { getCountry } from '@/lib/country'
import { formatDate } from '@/lib/format'
import { defaultPage, type StaticPageKey } from '@/lib/legal-defaults'
import { breadcrumbSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import { getStaticPage } from '@/sanity/queries'
import type { SiteSettings } from '@/sanity/types'

/** Shown as "Last updated" on built-in legal pages that have no CMS document yet. Bump when the default wording changes. */
const LEGAL_DEFAULTS_UPDATED = '2026-10-30'

/** The disclosure page only exists when the site earns commissions. */
function isAvailable(key: StaticPageKey, settings: SiteSettings): boolean {
  if (key === 'disclosure') return settings.modules.affiliate || settings.modules.offers
  return true
}

export async function staticPageMetadata(key: StaticPageKey): Promise<Metadata> {
  const settings = await getSettings()
  if (!isAvailable(key, settings)) return {}
  const doc = await getStaticPage(key)
  const fallback = defaultPage(key, settings)
  return buildMetadata({
    settings,
    title: doc?.title || fallback.title,
    description: doc?.description || fallback.description,
    path: `/${key}`,
  })
}

export default async function StaticPage({ pageKey, footer }: { pageKey: StaticPageKey; footer?: ReactNode }) {
  const settings = await getSettings()
  if (!isAvailable(pageKey, settings)) notFound()

  const doc = await getStaticPage(pageKey)
  const fallback = defaultPage(pageKey, settings)
  const country = getCountry(settings.country)
  const title = doc?.title || fallback.title
  const intro = doc ? doc.intro : fallback.intro
  const useCms = Boolean(doc?.body?.length)
  const updatedAt = doc?.updatedAt || (['privacy', 'terms', 'disclosure'].includes(pageKey) ? LEGAL_DEFAULTS_UPDATED : null)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: title, path: `/${pageKey}` }])} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: title }]} />

      <header className="mt-6 mb-8 pb-8 border-b border-surface-border">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary text-balance">{title}</h1>
        {intro && <p className="mt-3 text-lg text-text-muted">{intro}</p>}
        {updatedAt && <p className="mt-3 text-xs text-text-muted">Last updated {formatDate(updatedAt, country)}</p>}
      </header>

      <div className="article-body">
        {useCms ? (
          <PortableText value={doc!.body!} settings={settings} />
        ) : (
          fallback.sections.map((s) => (
            <section key={s.heading} className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-text-primary mb-3">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-text-primary/90 leading-[1.75] text-[17px] mb-4">{p}</p>
              ))}
            </section>
          ))
        )}
      </div>
      {footer}
    </div>
  )
}
