import Link from 'next/link'
import SanityImage from '@/components/ui/SanityImage'
import { formatDate, readTimeLabel } from '@/lib/format'
import type { CountryConfig } from '@/lib/country'
import { hasImage } from '@/sanity/image'
import type { PostCardData } from '@/sanity/types'

interface Props {
  post: PostCardData
  country: CountryConfig
  priority?: boolean
  /** Horizontal layout (used in lists / search-like views) */
  variant?: 'card' | 'row'
}

export default function PostCard({ post, country, priority, variant = 'card' }: Props) {
  const readTime = readTimeLabel(post.readMinutes)
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}`.trim() : ''
  const showImage = hasImage(post.mainImage)

  if (variant === 'row') {
    return (
      <Link
        href={`/${post.slug}`}
        className="group flex gap-4 p-3 sm:p-4 bg-surface-card border border-surface-border rounded-xl hover:border-brand-primary/40 transition-colors"
      >
        <div className="relative w-28 sm:w-44 aspect-video shrink-0 rounded-lg overflow-hidden bg-surface-raised">
          {showImage && <SanityImage image={post.mainImage} alt={post.mainImage?.alt || post.title} sizes="176px" />}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          {post.category && <span className="text-[11px] font-bold uppercase tracking-wide text-brand-primary mb-1">{post.category.title}</span>}
          <h3 className="font-heading font-bold text-base sm:text-lg leading-snug text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="mt-1.5 text-sm text-text-muted line-clamp-2 hidden sm:block">{post.excerpt}</p>}
          <time dateTime={post.publishedAt} className="mt-2 text-xs text-text-muted">{formatDate(post.publishedAt, country, 'short')}</time>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/${post.slug}`}
      className="group flex flex-col h-full bg-surface-card rounded-xl overflow-hidden border border-surface-border hover:border-brand-primary/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-video bg-surface-raised overflow-hidden border-b border-surface-border">
        {showImage ? (
          <SanityImage
            image={post.mainImage}
            alt={post.mainImage?.alt || post.title}
            priority={priority}
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-25" aria-hidden="true">📝</div>
        )}
        {post.category && (
          <span className="absolute top-3 start-3 bg-surface-card/95 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-md border border-surface-border shadow-sm">
            {post.category.title}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-lg leading-snug text-text-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h3>
        {post.excerpt && <p className="text-sm leading-relaxed text-text-muted line-clamp-3 mb-4 flex-1">{post.excerpt}</p>}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-border text-xs text-text-muted">
          <span className="truncate">{authorName}</span>
          <span className="shrink-0 inline-flex items-center gap-1.5">
            {readTime && <span className="hidden sm:inline">{readTime} ·</span>}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, country, 'short')}</time>
          </span>
        </div>
      </div>
    </Link>
  )
}
