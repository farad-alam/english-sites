import type { Metadata } from 'next'
import SectionRenderer from '@/components/sections'
import JsonLd from '@/components/ui/JsonLd'
import SetupNotice from '@/components/ui/SetupNotice'
import { HAS_SANITY } from '@/lib/config'
import { defaultHomeSections } from '@/lib/defaults'
import { organizationSchema, websiteSchema } from '@/lib/schema'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'

export const revalidate = false

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const meta = buildMetadata({ settings, path: '/' })
  return {
    ...meta,
    title: { absolute: settings.tagline ? `${settings.siteName} — ${settings.tagline}` : settings.siteName },
  }
}

export default async function HomePage() {
  const settings = await getSettings()
  const sections = settings.homeSections.length ? settings.homeSections : defaultHomeSections(settings.modules)

  return (
    <>
      <JsonLd data={[websiteSchema(settings), organizationSchema(settings)]} />
      {!HAS_SANITY && <SetupNotice />}
      <SectionRenderer sections={sections} settings={settings} />
    </>
  )
}
