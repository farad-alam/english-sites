import Link from 'next/link'
import type { CtaSection } from '@/sanity/types'

export default function Cta({ section }: { section: CtaSection }) {
  if (!section.heading) return null
  const href = section.buttonHref
  const external = href ? /^https?:\/\//i.test(href) : false
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-brand-primary text-on-primary px-6 py-10 sm:px-12 sm:py-14 text-center">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-balance">{section.heading}</h2>
          {section.text && <p className="mt-3 max-w-2xl mx-auto opacity-90">{section.text}</p>}
          {href && section.buttonLabel && (
            <div className="mt-6">
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-accent">{section.buttonLabel}</a>
              ) : (
                <Link href={href} className="btn btn-accent">{section.buttonLabel}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
