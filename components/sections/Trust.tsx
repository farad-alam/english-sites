import { BookOpen, Check, RefreshCw, ShieldCheck, Star, Users } from 'lucide-react'
import type { SiteSettings, TrustSection } from '@/sanity/types'

const ICONS = { shield: ShieldCheck, check: Check, refresh: RefreshCw, star: Star, book: BookOpen, users: Users } as const

function defaultItems(settings: SiteSettings) {
  const items = [
    { _key: 'd1', icon: 'book', title: 'Research-first', text: 'Every article is researched, fact-checked and written for real readers.' },
    { _key: 'd2', icon: 'refresh', title: 'Kept up to date', text: 'We revisit our guides regularly so the advice stays current.' },
  ]
  if (settings.modules.affiliate || settings.modules.offers) {
    items.push({ _key: 'd3', icon: 'shield', title: 'Independent', text: 'We may earn a commission, but it never changes what we recommend.' })
  } else {
    items.push({ _key: 'd3', icon: 'users', title: 'Reader-supported', text: 'Free to read, with no paywalls or sign-ups.' })
  }
  return items
}

export default function Trust({ section, settings }: { section: TrustSection; settings: SiteSettings }) {
  const items = section.items?.length ? section.items : defaultItems(settings)
  return (
    <section className="py-10 md:py-14" aria-label="Why trust us">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[(item.icon as keyof typeof ICONS) ?? 'check'] ?? Check
            return (
              <li key={item._key} className="flex gap-4 p-5 bg-surface-card border border-surface-border rounded-xl">
                <span className="shrink-0 w-11 h-11 rounded-lg bg-brand-soft text-brand-primary flex items-center justify-center">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-text-primary">{item.title}</h3>
                  {item.text && <p className="mt-1 text-sm text-text-muted leading-relaxed">{item.text}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
