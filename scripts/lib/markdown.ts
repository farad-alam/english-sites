/**
 * Markdown → Sanity Portable Text, for scripts/bulk-import.ts.
 * Supports: headings, paragraphs, bold/italic/links, bullet + numbered lists
 * (nested), block quotes and images. Tables and raw HTML are skipped with a warning.
 */
import { randomBytes } from 'node:crypto'
import { Lexer, type Token, type Tokens } from 'marked'

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type MarkDef = { _type: 'link'; _key: string; href: string; blank: boolean; sponsored: boolean }
export type PtBlock = Record<string, unknown> & { _type: string; _key: string }

export interface ConvertOptions {
  /** Called for every body image; return a Sanity asset id (e.g. after uploading) or null to skip it. */
  resolveImage?: (url: string, alt: string) => Promise<string | null>
  /** Called with human-readable notes about content that could not be converted. */
  warn?: (message: string) => void
  /** The article title — a leading "# Title" that repeats it is dropped. */
  title?: string
}

const key = () => randomBytes(5).toString('hex')

/** Links that look like affiliate links are marked sponsored (rel="sponsored nofollow"). */
const AFFILIATE_LINK = /(?:^https?:\/\/(?:amzn\.to|a\.co)\/)|(?:amazon\.[a-z.]+\/.*[?&]tag=)|[?&](?:aff|affiliate|ref|tag|tid|irclickid|clickid)=/i

function inline(tokens: Token[] | undefined, marks: string[], spans: Span[], defs: MarkDef[]) {
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'text': {
        const tt = t as Tokens.Text
        if (tt.tokens?.length) inline(tt.tokens, marks, spans, defs)
        else if (tt.text) spans.push({ _type: 'span', _key: key(), text: decode(tt.text), marks })
        break
      }
      case 'escape':
        spans.push({ _type: 'span', _key: key(), text: (t as Tokens.Escape).text, marks })
        break
      case 'strong':
        inline((t as Tokens.Strong).tokens, [...marks, 'strong'], spans, defs)
        break
      case 'em':
        inline((t as Tokens.Em).tokens, [...marks, 'em'], spans, defs)
        break
      case 'del':
        inline((t as Tokens.Del).tokens, marks, spans, defs)
        break
      case 'codespan':
        spans.push({ _type: 'span', _key: key(), text: decode((t as Tokens.Codespan).text), marks })
        break
      case 'br':
        spans.push({ _type: 'span', _key: key(), text: '\n', marks })
        break
      case 'link': {
        const link = t as Tokens.Link
        const internal = link.href.startsWith('/') || link.href.startsWith('#')
        const def: MarkDef = { _type: 'link', _key: key(), href: link.href, blank: !internal, sponsored: AFFILIATE_LINK.test(link.href) }
        defs.push(def)
        inline(link.tokens, [...marks, def._key], spans, defs)
        break
      }
      case 'image': {
        // Inline images inside a sentence are not supported; handled at block level.
        break
      }
      case 'html':
        break
      default: {
        const raw = (t as { raw?: string }).raw
        if (raw) spans.push({ _type: 'span', _key: key(), text: raw, marks })
      }
    }
  }
}

function decode(text: string): string {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function textBlock(tokens: Token[] | undefined, style: string, extra: Record<string, unknown> = {}): PtBlock | null {
  const spans: Span[] = []
  const markDefs: MarkDef[] = []
  inline(tokens, [], spans, markDefs)
  const text = spans.map((s) => s.text).join('').trim()
  if (!text) return null
  return { _type: 'block', _key: key(), style, markDefs, children: spans, ...extra }
}

async function convertTokens(tokens: Token[], opts: ConvertOptions, out: PtBlock[], list?: { type: 'bullet' | 'number'; level: number }, quote = false) {
  const warn = opts.warn ?? (() => {})
  for (const t of tokens) {
    switch (t.type) {
      case 'space':
      case 'hr':
        break
      case 'heading': {
        const h = t as Tokens.Heading
        const plain = h.text.trim()
        if (h.depth === 1 && opts.title && plain.toLowerCase() === opts.title.trim().toLowerCase()) break // repeated title
        const style = h.depth <= 2 ? 'h2' : h.depth === 3 ? 'h3' : 'h4'
        const block = textBlock(h.tokens, style)
        if (block) out.push(block)
        break
      }
      case 'paragraph': {
        const p = t as Tokens.Paragraph
        const onlyImage = p.tokens.length === 1 && p.tokens[0].type === 'image' ? (p.tokens[0] as Tokens.Image) : null
        if (onlyImage) {
          const assetId = opts.resolveImage ? await opts.resolveImage(onlyImage.href, onlyImage.text) : null
          if (assetId) {
            out.push({ _type: 'image', _key: key(), asset: { _type: 'reference', _ref: assetId }, alt: onlyImage.text || '' })
          } else warn(`Image skipped (use --upload-images to include body images): ${onlyImage.href}`)
          break
        }
        const block = textBlock(p.tokens, quote ? 'blockquote' : 'normal')
        if (block) out.push(block)
        break
      }
      case 'blockquote':
        await convertTokens((t as Tokens.Blockquote).tokens, opts, out, undefined, true)
        break
      case 'list': {
        const l = t as Tokens.List
        const level = (list?.level ?? 0) + 1
        const type = l.ordered ? 'number' : 'bullet'
        for (const item of l.items) {
          const own = item.tokens.filter((x) => x.type !== 'list')
          const first = own.find((x) => x.type === 'text' || x.type === 'paragraph') as Tokens.Text | Tokens.Paragraph | undefined
          const block = textBlock(first && 'tokens' in first ? first.tokens : [], 'normal', { listItem: type, level })
          if (block) out.push(block)
          const nested = item.tokens.filter((x) => x.type === 'list')
          if (nested.length) await convertTokens(nested, opts, out, { type, level })
        }
        break
      }
      case 'code': {
        const block = textBlock([{ type: 'text', raw: (t as Tokens.Code).text, text: (t as Tokens.Code).text } as Token], 'normal')
        if (block) out.push(block)
        warn('A code block was converted to a plain paragraph.')
        break
      }
      case 'table':
        warn('A table was skipped — add it in Studio as a "Ranked comparison table" or rewrite it as text.')
        break
      case 'html':
        warn('Raw HTML was skipped.')
        break
      default:
        break
    }
  }
}

export async function markdownToPortableText(markdown: string, opts: ConvertOptions = {}): Promise<PtBlock[]> {
  const tokens = new Lexer().lex(markdown)
  const out: PtBlock[] = []
  await convertTokens(tokens, opts, out)
  return out
}

/** Plain text of the first real paragraph — used as the excerpt when the file has none. */
export function firstParagraphText(blocks: PtBlock[], max = 155): string {
  const first = blocks.find((b) => b._type === 'block' && b.style === 'normal' && !b.listItem)
  const text = ((first?.children as Span[] | undefined) ?? []).map((s) => s.text).join('').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}
