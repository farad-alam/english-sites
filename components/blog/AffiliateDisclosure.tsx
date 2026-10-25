import Link from 'next/link'
import { getCountry } from '@/lib/country'
import type { SiteSettings } from '@/sanity/types'

export function defaultDisclosure(settings: SiteSettings): string {
  const country = getCountry(settings.country)
  return `Some links on this page are affiliate links. If you buy through them we may earn a commission at no extra cost to you. This never changes our recommendations — see our disclosure, which follows the guidance of ${country.adRegulator}.`
}

export default function AffiliateDisclosure({ settings }: { settings: SiteSettings }) {
  const text = settings.affiliate.disclosureText?.trim() || defaultDisclosure(settings)
  return (
    <aside className="my-6 rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-sm leading-relaxed text-text-muted" aria-label="Affiliate disclosure">
      <strong className="text-text-primary">Disclosure: </strong>
      {text}{' '}
      <Link href="/disclosure" className="underline underline-offset-2 hover:text-brand-primary">Read our full disclosure</Link>
    </aside>
  )
}
