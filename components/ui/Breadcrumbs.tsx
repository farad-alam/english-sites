import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="inline-flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={14} className="shrink-0 opacity-60" aria-hidden="true" />}
            {item.path && i < items.length - 1 ? (
              <Link href={item.path} className="inline-flex items-center min-h-[32px] hover:text-brand-primary">{item.name}</Link>
            ) : (
              <span aria-current="page" className="truncate max-w-[60vw] text-text-primary/80">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
