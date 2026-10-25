import Link from 'next/link'
import SectionHeading from '@/components/ui/SectionHeading'
import { getCategories } from '@/sanity/queries'
import type { CategoryGridSection } from '@/sanity/types'

export default async function CategoryGrid({ section }: { section: CategoryGridSection }) {
  const categories = (await getCategories()).filter((c) => !c.parentSlug && (c.postCount ?? 0) > 0)
  if (!categories.length) return null
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={section.title || 'Explore topics'} />
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((c) => (
            <li key={c._id}>
              <Link
                href={`/category/${c.slug}`}
                className="group flex flex-col h-full gap-1 p-4 sm:p-5 bg-surface-card border border-surface-border rounded-xl hover:border-brand-primary/40 hover:shadow-card-hover transition-all"
              >
                {c.icon && <span className="text-2xl" aria-hidden="true">{c.icon}</span>}
                <span className="font-heading font-bold text-text-primary group-hover:text-brand-primary transition-colors">{c.title}</span>
                <span className="text-xs text-text-muted">{c.postCount} article{c.postCount === 1 ? '' : 's'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
