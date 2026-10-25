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
export function wordCount(body: PortableTextBlock[] | undefined): number {
  let n = 0
  for (const block of body ?? []) {
    if (block._type === 'block') n += textOf(block).split(/\s+/).filter(Boolean).length
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
