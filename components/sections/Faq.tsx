import JsonLd from '@/components/ui/JsonLd'
import SectionHeading from '@/components/ui/SectionHeading'
import { faqSchema } from '@/lib/schema'
import type { FaqSection } from '@/sanity/types'

export default function Faq({ section }: { section: FaqSection }) {
  const items = section.items ?? []
  if (!items.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Frequently asked questions'} />
        <div className="space-y-3">
          {items.map((item) => (
            <details key={item._key} className="bg-surface-card border border-surface-border rounded-xl group open:shadow-card open:border-brand-primary/30">
              <summary className="px-5 py-4 min-h-[56px] cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 select-none">
                <span className="font-heading font-semibold text-text-primary leading-snug">{item.question}</span>
                <svg className="text-brand-primary shrink-0 transition-transform duration-200 group-open:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-3 text-text-primary/85 leading-relaxed border-t border-surface-border/60">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqSchema(items)} />
    </section>
  )
}
