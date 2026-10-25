import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { preload } from 'react-dom'
import '@/styles/globals.css'
import Analytics from '@/components/analytics/Analytics'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import { BASE_URL } from '@/lib/config'
import { getCountry } from '@/lib/country'
import { fontFileUrl, usedFonts } from '@/lib/fonts'
import { getSettings } from '@/lib/settings'
import { buildThemeCss, resolveTheme } from '@/lib/theme'
import { getImageUrl } from '@/sanity/image'
import { getNavCategories } from '@/sanity/queries'

export const revalidate = false

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSettings()
  const { primary } = resolveTheme(settings.theme)
  return { themeColor: primary, width: 'device-width', initialScale: 1 }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const icon = getImageUrl(settings.favicon, { width: 192, height: 192, crop: true, format: 'jpg' })
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: settings.tagline ? `${settings.siteName} — ${settings.tagline}` : settings.siteName,
      template: settings.seo.titleTemplate?.includes('%s') ? settings.seo.titleTemplate : `%s | ${settings.siteName}`,
    },
    description: settings.seo.defaultDescription || settings.tagline,
    applicationName: settings.siteName,
    ...(icon ? { icons: { icon } } : {}),
    verification: {
      google: settings.analytics.googleVerification,
      other: settings.analytics.bingVerification ? { 'msvalidate.01': settings.analytics.bingVerification } : undefined,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    formatDetection: { telephone: false },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getNavCategories()])
  const country = getCountry(settings.country)

  // Preload the Latin file of the fonts this site uses, so text appears in the right font immediately.
  for (const font of usedFonts(settings.theme.headingFont, settings.theme.bodyFont)) {
    preload(fontFileUrl(font), { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  }

  return (
    <html lang={country.htmlLang}>
      <head>
        {/* Theme variables: rendered on the server, so there is no colour flash */}
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: buildThemeCss(settings.theme) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Link
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:btn focus:btn-primary"
        >
          Skip to content
        </Link>
        <Analytics settings={settings} />
        <SiteHeader settings={settings} categories={categories} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} categories={categories} />
      </body>
    </html>
  )
}
