import type { PortableTextBlock } from '@/sanity/types'

const wordsIn = (block: PortableTextBlock): number => {
  const children = (block.children as { text?: string }[] | undefined) ?? []
  return children.map((c) => c?.text ?? '').join(' ').split(/\s+/).filter(Boolean).length
}

/**
 * Splits an article body so an ad can sit between the chunks. Spacing is by
 * words, not paragraphs, so short articles are not crowded with ads:
 * the first break comes after ~150 words of text, then roughly every 350 words,
 * at most 3 in total. It never splits a list, and keeps the last ~120 words ad-free.
 */
export function splitBodyForAds(
  body: PortableTextBlock[],
  opts: { firstWords?: number; everyWords?: number; tailWords?: number; max?: number } = {},
): PortableTextBlock[][] {
  const { firstWords = 150, everyWords = 350, tailWords = 120, max = 3 } = opts
  const isText = (b: PortableTextBlock) => b._type === 'block' && (b.style === 'normal' || b.listItem)
  const totalWords = body.filter(isText).reduce((n, b) => n + wordsIn(b), 0)
  if (totalWords < firstWords + tailWords) return [body]

  const chunks: PortableTextBlock[][] = []
  let current: PortableTextBlock[] = []
  let sinceBreak = 0
  let seen = 0
  let threshold = firstWords

  for (let i = 0; i < body.length; i++) {
    const block = body[i]
    current.push(block)
    if (!isText(block)) continue
    const n = wordsIn(block)
    sinceBreak += n
    seen += n
    const next = body[i + 1] as (PortableTextBlock & { listItem?: string }) | undefined
    const isParagraph = block.style === 'normal' && !block.listItem
    if (isParagraph && sinceBreak >= threshold && totalWords - seen >= tailWords && chunks.length < max && next && !next.listItem) {
      chunks.push(current)
      current = []
      sinceBreak = 0
      threshold = everyWords
    }
  }
  if (current.length) chunks.push(current)
  return chunks
}
