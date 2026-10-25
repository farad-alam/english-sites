import Link from 'next/link'

/** Crawlable prev/next links — pagination is plain URLs (/blog/page/2), so every page stays statically cached. */
export default function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null
  const href = (p: number) => (p <= 1 ? basePath : `${basePath}/page/${p}`)
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className="btn btn-outline">← Newer</Link>
      ) : (
        <span className="btn btn-outline opacity-40 pointer-events-none" aria-hidden="true">← Newer</span>
      )}
      <span className="text-sm text-text-muted tabular-nums">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className="btn btn-outline">Older →</Link>
      ) : (
        <span className="btn btn-outline opacity-40 pointer-events-none" aria-hidden="true">Older →</span>
      )}
    </nav>
  )
}
