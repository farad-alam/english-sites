import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import SearchClient from '@/components/blog/SearchClient'
import SectionHeading from '@/components/ui/SectionHeading'
import { getSettings } from '@/lib/settings'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Search', robots: { index: false, follow: true } }
}

export default async function SearchPage() {
  const settings = await getSettings()
  if (!settings.modules.blog) notFound()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <SectionHeading as="h1" title="Search" />
      <Suspense fallback={<p className="text-text-muted">Loading search…</p>}>
        <SearchClient dateLocale={settings.country} />
      </Suspense>
    </div>
  )
}
