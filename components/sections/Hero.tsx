import Link from 'next/link'
import { Search } from 'lucide-react'
import SanityImage from '@/components/ui/SanityImage'
import { hasImage } from '@/sanity/image'
import { getNavCategories } from '@/sanity/queries'
import type { HeroSection, SiteSettings } from '@/sanity/types'

function Cta({ href, label, kind, onColor }: { href?: string; label?: string; kind: 'primary' | 'outline'; onColor: boolean }) {
  if (!href || !label) return null
  // On a brand-colour or photo background the main button uses the accent colour (a brand-colour button would vanish).
  const cls = `btn ${kind === 'primary' ? (onColor ? 'btn-accent' : 'btn-primary') : 'btn-outline'}`
  return /^https?:\/\//i.test(href) ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
  ) : (
    <Link href={href} className={cls}>{label}</Link>
  )
}

const OVERLAY = { light: 'bg-black/30', medium: 'bg-black/50', dark: 'bg-black/65' } as const

/**
 * The top banner. Kept deliberately light: no client JavaScript, one optional
 * image (resized by Sanity's CDN, loaded first because it is the largest thing
 * on screen), and a plain brand-colour background when there is no image.
 */
export default async function Hero({ section, settings }: { section: HeroSection; settings: SiteSettings }) {
  const heading = section.heading?.trim() || settings.siteName
  const sub = section.subheading?.trim() || settings.tagline
  const hasImg = hasImage(section.image)
  const split = section.variant === 'split' && hasImg
  const onImage = hasImg && !split // picture behind the text → always white text on a dark veil
  const search = section.showSearch !== false && settings.modules.blog
  const topics = section.showTopics !== false && settings.modules.blog && !split ? (await getNavCategories()).filter((c) => !c.parentId).slice(0, 6) : []

  const tone = split
    ? { text: 'text-text-primary', muted: 'text-text-muted', eyebrow: 'text-brand-primary', chip: 'border-surface-border bg-surface-card text-text-primary hover:border-brand-primary/50 hover:text-brand-primary', chipLabel: 'text-text-muted' }
    : onImage
      ? { text: 'text-white', muted: 'text-white/85', eyebrow: 'text-white/90', chip: 'border-white/30 bg-white/15 text-white hover:bg-white/25', chipLabel: 'text-white/80' }
      : { text: 'text-on-primary', muted: 'text-on-primary/85', eyebrow: 'text-on-primary/90', chip: 'border-on-primary/30 bg-on-primary/10 text-on-primary hover:bg-on-primary/20', chipLabel: 'text-on-primary/80' }

  const text = (
    <div className={split ? '' : 'max-w-3xl mx-auto text-center'}>
      {section.eyebrow && <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${tone.eyebrow}`}>{section.eyebrow}</p>}
      <h1 className={`font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance ${tone.text}`}>{heading}</h1>
      {sub && <p className={`mt-4 text-lg ${tone.muted} ${split ? '' : 'max-w-2xl mx-auto'}`}>{sub}</p>}

      {search && (
        <form action="/search" method="get" role="search" className={`mt-7 relative ${split ? 'max-w-md' : 'max-w-xl mx-auto'}`}>
          <label htmlFor="hero-search" className="sr-only">Search articles</label>
          <Search size={20} className="absolute top-1/2 -translate-y-1/2 start-4 text-text-muted pointer-events-none" aria-hidden="true" />
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="Search articles…"
            className="w-full h-14 ps-12 pe-28 rounded-full bg-surface-card border border-surface-border text-text-primary placeholder:text-text-muted outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 shadow-sm-light"
          />
          <button type="submit" className="absolute top-1.5 bottom-1.5 end-1.5 px-5 rounded-full bg-brand-primary hover:bg-brand-dark text-on-primary text-sm font-bold">
            Search
          </button>
        </form>
      )}

      {topics.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
          <span className={`text-sm ${tone.chipLabel}`}>Popular:</span>
          {topics.map((c) => (
            <Link key={c._id} href={`/category/${c.slug}`} className={`inline-flex items-center min-h-[36px] px-3.5 rounded-full border text-sm font-medium transition-colors ${tone.chip}`}>
              {c.title}
            </Link>
          ))}
        </div>
      )}

      {(section.primaryCta?.href || section.secondaryCta?.href) && (
        <div className={`mt-7 flex flex-wrap gap-3 ${split ? '' : 'justify-center'}`}>
          <Cta kind="primary" onColor={!split} href={section.primaryCta?.href} label={section.primaryCta?.label} />
          <Cta kind="outline" onColor={!split} href={section.secondaryCta?.href} label={section.secondaryCta?.label} />
        </div>
      )}
    </div>
  )

  return (
    <section
      className={`relative isolate overflow-hidden border-b border-surface-border ${
        split ? 'bg-gradient-to-b from-brand-soft/70 to-surface-base' : onImage ? 'bg-neutral-900' : 'bg-brand-primary'
      }`}
    >
      {onImage && (
        <>
          <SanityImage image={section.image} alt="" priority quality={60} sizes="100vw" className="-z-20" />
          <div className={`absolute inset-0 -z-10 ${OVERLAY[section.overlay ?? 'medium']}`} aria-hidden="true" />
        </>
      )}
      {!split && !onImage && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_85%_0%,rgb(var(--brand-gradient)/0.55),transparent)]" aria-hidden="true" />
      )}
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
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
