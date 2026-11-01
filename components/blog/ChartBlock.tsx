type Point = { _key?: string; label: string; value: number }

type ChartValue = {
  title?: string
  chartType?: 'bar' | 'line' | 'donut'
  unit?: string
  caption?: string
  points?: Array<{ _key?: string; label?: string; value?: number }>
}

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

function Bars({ points, unit }: { points: Point[]; unit: string }) {
  const max = Math.max(...points.map((p) => p.value), 1)
  return (
    <ul className="space-y-3 text-brand-primary">
      {points.map((p, i) => (
        <li key={p._key || i}>
          <div className="flex items-baseline justify-between gap-3 text-sm text-text-primary">
            <span>{p.label}</span>
            <span className="font-semibold">
              {nf.format(p.value)}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-text-muted/15" aria-hidden="true">
            <div className="h-full rounded-full bg-current" style={{ width: Math.max((p.value / max) * 100, 1) + '%' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Line({ points, unit }: { points: Point[]; unit: string }) {
  const W = 640
  const H = 280
  const L = 48
  const R = 48
  const T = 28
  const B = 44
  const max = Math.max(...points.map((p) => p.value), 1)
  const step = points.length > 1 ? (W - L - R) / (points.length - 1) : 0
  const xy = points.map((p, i) => ({
    p,
    x: L + (points.length > 1 ? i * step : (W - L - R) / 2),
    y: T + (1 - p.value / max) * (H - T - B),
  }))
  return (
    <div className="text-brand-primary">
      <svg viewBox={'0 0 ' + W + ' ' + H} className="h-auto w-full" aria-hidden="true">
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="currentColor" strokeOpacity="0.2" />
        <polyline
          points={xy.map((c) => c.x + ',' + c.y).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {xy.map((c, i) => (
          <g key={c.p._key || i}>
            <circle cx={c.x} cy={c.y} r="5" fill="currentColor" />
            <g className="text-text-primary">
              <text x={c.x} y={c.y - 12} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                {nf.format(c.p.value)}
              </text>
            </g>
            <g className="text-text-muted">
              <text x={c.x} y={H - B + 22} textAnchor="middle" fontSize="12" fill="currentColor">
                {c.p.label.length > 12 ? c.p.label.slice(0, 11) + '…' : c.p.label}
              </text>
            </g>
          </g>
        ))}
      </svg>
      {unit ? <p className="mt-1 text-xs text-text-muted">Values in{unit}</p> : null}
      <table className="sr-only">
        <tbody>
          {points.map((p, i) => (
            <tr key={p._key || i}>
              <th scope="row">{p.label}</th>
              <td>
                {nf.format(p.value)}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Donut({ points, unit }: { points: Point[]; unit: string }) {
  const total = points.reduce((s, p) => s + p.value, 0) || 1
  const radius = 45
  const circ = 2 * Math.PI * radius
  const n = points.length
  const opacity = (i: number) => (n > 1 ? 1 - (i * 0.75) / (n - 1) : 1)
  let acc = 0
  return (
    <div className="flex flex-col items-center gap-6 text-brand-primary sm:flex-row sm:justify-center">
      <svg viewBox="0 0 120 120" className="h-44 w-44 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="18" />
        {points.map((p, i) => {
          const len = Math.max((p.value / total) * circ - 1, 0)
          const offset = -acc
          acc += (p.value / total) * circ
          return (
            <circle
              key={p._key || i}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity={opacity(i)}
              strokeWidth="18"
              strokeDasharray={len + ' ' + (circ - len)}
              strokeDashoffset={offset}
            />
          )
        })}
      </svg>
      <ul className="w-full space-y-2 text-sm text-text-primary sm:w-auto">
        {points.map((p, i) => (
          <li key={p._key || i} className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-current text-brand-primary" style={{ opacity: opacity(i) }} aria-hidden="true" />
            <span>{p.label}</span>
            <span className="ml-auto pl-4 font-semibold">
              {nf.format(p.value)}
              {unit} {'·'} {Math.round((p.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Server component: plain HTML and SVG, no client JavaScript, so the page stays static and cheap.
export default function ChartBlock({ value }: { value: ChartValue }) {
  const points = (value?.points || []).filter(
    (p) => p && typeof p.label === 'string' && p.label && typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0,
  ) as Point[]
  if (!value?.title || points.length < 2) return null
  const type = value.chartType || 'bar'
  const unit = value.unit ? (value.unit === '%' ? '%' : ' ' + value.unit) : ''
  return (
    <figure className="my-8 rounded-xl border border-text-muted/20 p-5 sm:p-6">
      <p className="mb-4 font-heading text-lg font-bold text-text-primary">{value.title}</p>
      {type === 'line' ? <Line points={points} unit={unit} /> : type === 'donut' ? <Donut points={points} unit={unit} /> : <Bars points={points} unit={unit} />}
      {value.caption ? <figcaption className="mt-4 text-sm text-text-muted">{value.caption}</figcaption> : null}
    </figure>
  )
}
