import Link from 'next/link'
import SanityImage from '@/components/ui/SanityImage'
import { formatDate } from '@/lib/format'
import type { CountryConfig } from '@/lib/country'
import type { PostCardData } from '@/sanity/types'

interface Props {
  posts?: PostCardData[]
  country: CountryConfig
  variant?: 'sidebar' | 'rail'
  className?: string
}

export default function RelatedArticles({ posts, country, variant = 'sidebar', className = '' }: Props) {
  if (!posts?.length) return null
  const headingId = `related-${variant}`

  if (variant === 'rail') {
    return (
      <section aria-labelledby={headingId} className={`defer-render ${className}`}>
        <h2 id={headingId} className="font-heading font-bold text-text-primary text-xl mb-4">Keep reading</h2>
        <ul className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 scroll-px-4 pb-3 scrollbar-hide overscroll-x-contain">
          {posts.map((p) => (
            <li key={p._id} className="snap-start shrink-0 w-[74%] max-w-[300px] sm:w-[46%]">
              <Link href={`/${p.slug}`} className="group block h-full bg-surface-card rounded-xl border border-surface-border overflow-hidden shadow-card active:scale-[0.99] transition-transform">
                <div className="relative aspect-[16/10] bg-surface-raised">
                  <SanityImage image={p.mainImage} alt={p.mainImage?.alt || p.title} sizes="300px" />
                </div>
                <div className="p-3.5">
                  <h3 className="font-heading text-[15px] font-bold text-text-primary leading-snug line-clamp-3 group-hover:text-brand-primary transition-colors">{p.title}</h3>
                  <time dateTime={p.publishedAt} className="text-xs text-text-muted mt-2 block">{formatDate(p.publishedAt, country, 'short')}</time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section aria-labelledby={headingId} className={`bg-surface-card rounded-xl border border-surface-border p-5 ${className}`}>
      <h2 id={headingId} className="font-heading font-bold text-text-primary text-lg mb-4 border-b border-surface-border pb-3">Keep reading</h2>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p._id}>
            <Link href={`/${p.slug}`} className="group flex gap-3 items-start">
              <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-raised border border-surface-border">
                <SanityImage image={p.mainImage} alt={p.mainImage?.alt || p.title} sizes="80px" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-3 group-hover:text-brand-primary transition-colors">{p.title}</h3>
                <time dateTime={p.publishedAt} className="text-xs text-text-muted mt-1 block">{formatDate(p.publishedAt, country, 'short')}</time>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
