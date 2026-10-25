import Link from 'next/link'
import { Search } from 'lucide-react'
import SanityImage from '@/components/ui/SanityImage'
import { hasImage } from '@/sanity/image'
import type { HeroSection, SiteSettings } from '@/sanity/types'

function Cta({ href, label, kind }: { href?: string; label?: string; kind: 'primary' | 'outline' }) {
  if (!href || !label) return null
  const cls = `btn ${kind === 'primary' ? 'btn-primary' : 'btn-outline'}`
  return /^https?:\/\//i.test(href) ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
  ) : (
    <Link href={href} className={cls}>{label}</Link>
  )
}

export default function Hero({ section, settings }: { section: HeroSection; settings: SiteSettings }) {
  const heading = section.heading?.trim() || settings.siteName
  const sub = section.subheading?.trim() || settings.tagline
  const split = section.variant === 'split' && hasImage(section.image)

  const text = (
    <div className={split ? '' : 'max-w-3xl mx-auto text-center'}>
      {section.eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3">{section.eyebrow}</p>}
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-text-primary text-balance">{heading}</h1>
      {sub && <p className={`mt-4 text-lg text-text-muted ${split ? '' : 'max-w-2xl mx-auto'}`}>{sub}</p>}

      {section.showSearch && settings.modules.blog && (
        <form action="/search" method="get" role="search" className={`mt-7 relative ${split ? 'max-w-md' : 'max-w-xl mx-auto'}`}>
          <label htmlFor="hero-search" className="sr-only">Search articles</label>
          <Search size={20} className="absolute top-1/2 -translate-y-1/2 start-4 text-text-muted pointer-events-none" aria-hidden="true" />
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="Search articles…"
            className="w-full h-14 ps-12 pe-28 rounded-full bg-surface-card border border-surface-border text-text-primary placeholder:text-text-muted outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
          />
          <button type="submit" className="absolute top-1.5 bottom-1.5 end-1.5 px-5 rounded-full bg-brand-primary hover:bg-brand-dark text-on-primary text-sm font-bold">
            Search
          </button>
        </form>
      )}

      {(section.primaryCta?.href || section.secondaryCta?.href) && (
        <div className={`mt-7 flex flex-wrap gap-3 ${split ? '' : 'justify-center'}`}>
          <Cta kind="primary" href={section.primaryCta?.href} label={section.primaryCta?.label} />
          <Cta kind="outline" href={section.secondaryCta?.href} label={section.secondaryCta?.label} />
        </div>
      )}
    </div>
  )

  return (
    <section className="bg-gradient-to-b from-brand-soft/70 to-surface-base border-b border-surface-border">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {split ? (
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {text}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-surface-border shadow-lg-light">
              <SanityImage image={section.image} alt={section.image?.alt ?? ''} priority sizes="(min-width: 768px) 560px, 100vw" />
            </div>
          </div>
        ) : (
          text
        )}
      </div>
    </section>
  )
}
