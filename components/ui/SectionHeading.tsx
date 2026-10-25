import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  title: string
  eyebrow?: string
  subtitle?: string
  href?: string
  linkLabel?: string
  as?: 'h1' | 'h2'
}

export default function SectionHeading({ title, eyebrow, subtitle, href, linkLabel = 'View all', as: Tag = 'h2' }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
      <div className="min-w-0">
        {eyebrow && <span className="block text-xs font-bold uppercase tracking-widest text-brand-primary mb-2">{eyebrow}</span>}
        <Tag className="font-heading font-extrabold text-2xl md:text-3xl text-text-primary text-balance">{title}</Tag>
        {subtitle && <p className="mt-2 text-text-muted max-w-2xl">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-text-muted hover:text-brand-primary shrink-0">
          {linkLabel}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
