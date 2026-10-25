import Link from 'next/link'
import { getImageUrl } from '@/sanity/image'
import type { SiteSettings } from '@/sanity/types'

export default function Logo({ settings, className = '' }: { settings: SiteSettings; className?: string }) {
  const height = settings.logoHeight && settings.logoHeight >= 20 ? settings.logoHeight : 36
  const src = getImageUrl(settings.logo, { height: height * 2 })
  return (
    <Link href="/" className={`inline-flex items-center gap-2 min-h-[44px] ${className}`} aria-label={`${settings.siteName} — home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={settings.logo?.alt || settings.siteName} height={height} style={{ height, width: 'auto' }} />
      ) : (
        <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary">{settings.siteName}</span>
      )}
    </Link>
  )
}
