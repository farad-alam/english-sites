'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

type Entry = {
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  categoryTitle: string
  image: string | null
  imageAlt: string
}

/** Lower-case and strip accents so "cafe" finds "café". */
function normalize(input: string): string {
  return input.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export default function SearchClient({ dateLocale }: { dateLocale: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get('q') ?? ''
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((data: Entry[]) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [])

  const query = normalize(initial)
  const results = useMemo(() => {
    if (!entries || !query) return []
    const terms = query.split(/\s+/).filter(Boolean)
    return entries
      .map((e) => {
        const title = normalize(e.title)
        const rest = normalize(`${e.excerpt} ${e.categoryTitle}`)
        let score = 0
        for (const term of terms) {
          if (title.includes(term)) score += 3
          else if (rest.includes(term)) score += 1
          else return null // every word must match somewhere
        }
        return { e, score }
      })
      .filter((r): r is { e: Entry; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.e)
  }, [entries, query])

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const q = String(new FormData(ev.currentTarget).get('q') ?? '').trim()
    router.push(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  const fmt = new Intl.DateTimeFormat(dateLocale === 'en-US' ? 'en-US' : dateLocale, { dateStyle: 'medium', timeZone: 'UTC' })

  return (
    <div>
      <form onSubmit={submit} role="search" className="relative max-w-2xl">
        <label htmlFor="search-box" className="sr-only">Search articles</label>
        <Search size={20} className="absolute top-1/2 -translate-y-1/2 start-5 text-text-muted pointer-events-none" aria-hidden="true" />
        <input
          id="search-box"
          name="q"
          key={initial}
          defaultValue={initial}
          type="search"
          autoFocus={!initial}
          placeholder="Search articles…"
          className="w-full h-14 ps-14 pe-28 rounded-full bg-surface-card border border-surface-border text-text-primary placeholder:text-text-muted outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
        />
        <button type="submit" className="absolute top-1.5 bottom-1.5 end-1.5 px-6 rounded-full bg-brand-primary hover:bg-brand-dark text-on-primary text-sm font-bold">
          Search
        </button>
      </form>

      <div className="mt-10" aria-live="polite">
        {!initial.trim() ? (
          <p className="text-text-muted">Type a few words to find articles.</p>
        ) : failed ? (
          <p className="text-state-error">Search is unavailable right now. Please try again later.</p>
        ) : entries === null ? (
          <p className="text-text-muted">Loading…</p>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-10 text-center text-text-muted">
            Nothing matched “{initial}”. Try different or fewer words.
          </div>
        ) : (
          <>
            <p className="text-text-muted text-sm mb-6">
              {results.length} result{results.length === 1 ? '' : 's'} for “<span className="text-text-primary">{initial}</span>”
            </p>
            <ul className="grid gap-4">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.slug}`} className="group flex gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-primary/40 transition-colors">
                    <div className="relative w-28 sm:w-44 aspect-video shrink-0 rounded-xl overflow-hidden bg-surface-raised">
                      {r.image && <Image src={r.image} alt={r.imageAlt} fill sizes="176px" className="object-cover" unoptimized={!r.image.startsWith('https://cdn.sanity.io/')} />}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      {r.categoryTitle && <span className="text-[11px] font-bold uppercase tracking-wide text-brand-primary mb-1">{r.categoryTitle}</span>}
                      <h2 className="font-heading font-bold text-text-primary text-base sm:text-lg leading-snug group-hover:text-brand-primary transition-colors">{r.title}</h2>
                      {r.excerpt && <p className="text-text-muted text-sm mt-1.5 line-clamp-2">{r.excerpt}</p>}
                      <span className="text-xs text-text-muted mt-2">{fmt.format(new Date(r.publishedAt))}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
