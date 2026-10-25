import type { CountryConfig } from './country'
import { BASE_URL } from './config'

export function formatDate(iso: string | undefined, country: CountryConfig, style: 'long' | 'short' = 'long'): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(country.htmlLang, {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

export function absoluteUrl(path = '/'): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function truncate(text: string | undefined, max: number): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

/** "8 min read" — null for tiny/empty content. */
export function readTimeLabel(minutes: number | undefined): string | null {
  if (!minutes || minutes < 1) return null
  return `${Math.max(1, Math.round(minutes))} min read`
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/** Stars as text, e.g. 4.5 → "4.5/5" */
export function ratingLabel(rating: number | undefined): string | null {
  if (typeof rating !== 'number') return null
  return `${rating % 1 === 0 ? rating.toFixed(1) : rating.toFixed(1)}/5`
}
