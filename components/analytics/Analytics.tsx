import Script from 'next/script'
import type { SiteSettings } from '@/sanity/types'

/**
 * Ad + analytics scripts, all driven by Site Settings. Nothing loads for IDs
 * that are not set, so a fresh site ships zero third-party JavaScript.
 *
 * Cookie consent: with "Google CMP" selected, analytics/ads start in the
 * *denied* state for UK + EEA visitors and are upgraded by Google's consent
 * message (set up in AdSense → Privacy & messaging). Visitors elsewhere are
 * unaffected.
 */
const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT',
  'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB',
]

export default function Analytics({ settings }: { settings: SiteSettings }) {
  const { ads, analytics } = settings
  const adsenseId = ads.adsenseClientId
  const ga4 = analytics.ga4Id
  const clarity = analytics.clarityId
  const useConsent = ads.consentMode === 'google-cmp' && Boolean(adsenseId || ga4)

  return (
    <>
      {useConsent && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500,region:${JSON.stringify(CONSENT_REGIONS)}});`,
          }}
        />
      )}

      {adsenseId && (
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      )}

      {ga4 && (
        <>
          <Script id="ga4-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}');`,
            }}
          />
        </>
      )}

      {clarity && (
        <Script
          id="clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarity)});`,
          }}
        />
      )}
    </>
  )
}
