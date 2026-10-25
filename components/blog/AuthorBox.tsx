import Link from 'next/link'
import SanityImage from '@/components/ui/SanityImage'
import { hasImage } from '@/sanity/image'
import type { Author, SiteSettings } from '@/sanity/types'

export default function AuthorBox({ author, settings }: { author?: Author | null; settings: SiteSettings }) {
  // Neutral fallback when no author is assigned
  if (!author) {
    const name = `${settings.siteName} Editorial Team`
    return (
      <div className="flex items-start gap-4 bg-surface-card border border-surface-border rounded-xl p-5 mb-10">
        <div className="shrink-0 w-12 h-12 rounded-full bg-brand-soft border border-brand-primary/20 flex items-center justify-center font-heading font-bold text-brand-primary" aria-hidden="true">
          {settings.siteName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-text-primary text-sm">{name}</p>
          <p className="text-text-muted text-xs leading-relaxed mt-0.5">Researched, written and regularly updated by our editorial team.</p>
        </div>
      </div>
    )
  }

  const fullName = `${author.firstName} ${author.lastName}`.trim()
  const socials = [
    { label: 'LinkedIn', href: author.linkedin },
    { label: 'X', href: author.x },
    { label: 'Website', href: author.website },
  ].filter((s) => s.href)

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-6 mb-8 md:mb-10">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-soft border border-surface-border shrink-0">
          {hasImage(author.avatar) ? (
            <SanityImage image={author.avatar} alt={author.avatar?.alt || fullName} sizes="56px" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-brand-primary">
              {`${author.firstName?.[0] ?? ''}${author.lastName?.[0] ?? ''}`.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-text-primary">
            {fullName}
            {author.yearsExperience ? <span className="font-normal text-xs text-text-muted"> · {author.yearsExperience}+ years’ experience</span> : null}
          </p>
          {author.jobTitle && <p className="text-brand-primary text-xs mt-0.5">{author.jobTitle}</p>}
          {author.shortBio && <p className="text-text-muted text-sm leading-relaxed mt-2">{author.shortBio}</p>}
          {!!author.expertiseAreas?.length && (
            <ul className="flex flex-wrap gap-1.5 mt-3">
              {author.expertiseAreas.map((area) => (
                <li key={area} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-soft text-brand-primary border border-brand-primary/20">{area}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-x-4 mt-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center min-h-[44px] text-sm text-brand-primary hover:underline">{s.label}</a>
            ))}
            <Link href={`/authors/${author.slug}`} className="inline-flex items-center min-h-[44px] text-sm font-semibold text-brand-primary hover:underline sm:ms-auto">
              More from {author.firstName} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
