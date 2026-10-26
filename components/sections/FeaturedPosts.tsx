import Link from 'next/link'
import PostCard from '@/components/blog/PostCard'
import SanityImage from '@/components/ui/SanityImage'
import SectionHeading from '@/components/ui/SectionHeading'
import { getCountry } from '@/lib/country'
import { formatDate } from '@/lib/format'
import { getPostsByIds } from '@/sanity/queries'
import type { FeaturedPostsSection, SiteSettings } from '@/sanity/types'

export default async function FeaturedPosts({ section, settings }: { section: FeaturedPostsSection; settings: SiteSettings }) {
  const posts = await getPostsByIds(section.postIds ?? [])
  if (!posts.length) return null
  const country = getCountry(settings.country)
  const [lead, ...rest] = posts

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Featured articles'} />
        <div className="grid gap-6 lg:grid-cols-5">
          <Link href={`/${lead.slug}`} className="group lg:col-span-3 relative block rounded-2xl overflow-hidden border border-surface-border bg-surface-raised min-h-[320px]">
            <SanityImage image={lead.mainImage} alt={lead.mainImage?.alt || lead.title} sizes="(min-width: 1024px) 60vw, 100vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
              {lead.category && <span className="inline-block text-xs font-bold uppercase tracking-wide bg-white/20 backdrop-blur px-2.5 py-1 rounded-md mb-3">{lead.category.title}</span>}
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl leading-tight text-balance">{lead.title}</h3>
              <p className="mt-2 text-sm text-white/80">{formatDate(lead.publishedAt, country)}</p>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="lg:col-span-2 grid gap-4 content-start">
              {rest.slice(0, 4).map((p) => (
                <PostCard key={p._id} post={p} country={country} variant="row" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
