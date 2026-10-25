import AdSlot from './AdSlot'
import type { SiteSettings } from '@/sanity/types'

/** Renders an ad only when AdSense and that specific slot are configured in Site Settings. */
export default function Ad({ settings, position, className }: { settings: SiteSettings; position: 'top' | 'inArticle' | 'sidebar'; className?: string }) {
  const client = settings.ads.adsenseClientId
  const slot = position === 'top' ? settings.ads.topSlot : position === 'sidebar' ? settings.ads.sidebarSlot : settings.ads.inArticleSlot
  if (!client || !slot) return null
  return <AdSlot client={client} slot={slot} className={className} />
}
