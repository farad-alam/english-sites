/** Rating as stars + number. Decorative stars are hidden from screen readers; the label carries the value. */
export default function Stars({ rating, className = '' }: { rating?: number | null; className?: string }) {
  if (typeof rating !== 'number' || Number.isNaN(rating)) return null
  const clamped = Math.min(5, Math.max(0, rating))
  const pct = (clamped / 5) * 100
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="img" aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
      <span className="relative inline-block text-[15px] leading-none tracking-[1px]" aria-hidden="true">
        <span className="text-surface-border">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-amber-400 whitespace-nowrap" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="text-sm font-bold text-text-primary tabular-nums">{clamped.toFixed(1)}</span>
    </span>
  )
}
