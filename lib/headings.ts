import type { PortableTextBlock } from '@/sanity/types'

export interface HeadingInfo {
  key: string
  id: string
  text: string
  level: 'h2' | 'h3'
}

export function slugifyHeading(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function textOf(block: PortableTextBlock): string {
  const children = (block.children as { text?: string }[] | undefined) ?? []
  return children.map((c) => c?.text ?? '').join('').trim()
}

/** H2/H3 headings with unique, stable anchor ids — shared by the article body and the table of contents. */
export function getHeadings(body: PortableTextBlock[] | undefined): HeadingInfo[] {
  const seen = new Map<string, number>()
  const out: HeadingInfo[] = []
  for (const block of body ?? []) {
    if (block._type !== 'block' || (block.style !== 'h2' && block.style !== 'h3')) continue
    const text = textOf(block)
    const base = slugifyHeading(text)
    if (!text || !base) continue
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    out.push({ key: block._key, id: n === 1 ? base : `${base}-${n}`, text, level: block.style as 'h2' | 'h3' })
  }
  return out
}

/** Rough word count for Article structured data. */
const SKIP_KEYS = new Set(['url', 'href', 'slug', 'style', 'type', 'chartType', 'tone', 'asset', 'image', 'affiliateUrl', 'link', 'listItem'])

/** Collect every readable string in a custom block (tables, FAQ, callouts, checklists, cards...). */
function plainText(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const v of value) plainText(v, out)
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.startsWith('_') || SKIP_KEYS.has(k)) continue
      plainText(v, out)
    }
  }
}

export function wordCount(body: PortableTextBlock[] | undefined): number {
  let n = 0
  for (const block of body ?? []) {
    const parts: string[] = []
    if (block._type === 'block') parts.push(textOf(block))
    else plainText(block, parts)
    n += parts.join(' ').split(/\s+/).filter(Boolean).length
  }
  return n
}

/** Question/answer pairs from every FAQ block in a body (for FAQPage structured data). */
export function collectFaqs(body: PortableTextBlock[] | undefined): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = []
  for (const block of body ?? []) {
    if (block._type !== 'faqBlock') continue
    for (const item of (block.items as { question?: string; answer?: string }[] | undefined) ?? []) {
      if (item.question && item.answer) out.push({ question: item.question, answer: item.answer })
    }
  }
  return out
}
