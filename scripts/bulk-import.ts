/**
 * Bulk-publish articles from Markdown files.
 *
 *   npm run bulk-import -- ./articles                 # import every .md file in the folder
 *   npm run bulk-import -- ./articles --dry-run       # show what would happen, write nothing
 *   npm run bulk-import -- ./articles --upload-images # download cover/body images into Sanity (recommended)
 *   npm run bulk-import -- ./articles --update        # overwrite articles that were imported before
 *   npm run bulk-import -- ./articles --draft         # create drafts you can review and publish in Studio
 *   npm run bulk-import -- ./articles --author "Sam Rivera"   # default author
 *   npm run bulk-import -- ./articles --ndjson out.ndjson     # write a file instead of calling the API
 *
 * Each file starts with front matter:
 *
 *   ---
 *   title: Best Standing Desks in 2026
 *   slug: best-standing-desks          # optional — made from the title
 *   excerpt: One or two sentences…     # optional — first paragraph is used
 *   category: Home Office              # created if it does not exist
 *   author: Sam Rivera                 # optional if --author is given
 *   publishedAt: 2026-10-01            # optional — now
 *   image: https://example.com/a.jpg   # cover image URL
 *   imageAlt: A tidy desk              # alt text
 *   articleType: review                # review | comparison | howto | listicle | informational | news
 *   keywords: [standing desk, ergonomics]
 *   affiliateDisclosure: true
 *   noIndex: false
 *   ---
 *   Article text in Markdown…
 *
 * Re-running is safe: articles that already exist are skipped unless you pass --update.
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import matter from 'gray-matter'
import { adminClient, fail, flagValue, hasFlag } from './lib/admin'
import { firstParagraphText, markdownToPortableText, type PtBlock } from './lib/markdown'

const target = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined
if (!target) fail('Usage: npm run bulk-import -- <folder-or-file.md> [--dry-run] [--upload-images] [--update] [--draft] [--author "Name"] [--ndjson file]')

const dryRun = hasFlag('dry-run')
const ndjsonPath = flagValue('ndjson')
const upload = hasFlag('upload-images')
const update = hasFlag('update')
const asDraft = hasFlag('draft')
const defaultAuthor = flagValue('author')
// Without credentials, --dry-run and --ndjson still work: authors and existing articles just can't be looked up.
const offline = Boolean(ndjsonPath) || (dryRun && !process.env.SANITY_WRITE_TOKEN)

const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)

function listFiles(path: string): string[] {
  const full = resolve(path)
  if (statSync(full).isFile()) return [full]
  return readdirSync(full)
    .filter((f) => ['.md', '.markdown'].includes(extname(f).toLowerCase()) && !f.startsWith('_'))
    .sort()
    .map((f) => join(full, f))
}

const files = listFiles(target)
if (!files.length) fail(`No .md files found in ${target}`)

const client = offline ? null : adminClient()

// Existing categories, authors and articles (for matching and de-duplication)
type Named = { _id: string; title?: string; slug?: string; firstName?: string; lastName?: string }
const categories: Named[] = client ? await client.fetch(`*[_type == "category"]{ _id, title, "slug": slug.current }`) : []
const authors: Named[] = client ? await client.fetch(`*[_type == "author"]{ _id, firstName, lastName, "slug": slug.current }`) : []
const existingSlugs = new Set<string>(client ? await client.fetch(`*[_type == "post"].slug.current`) : [])

const findCategory = (name: string) => categories.find((c) => c.title?.toLowerCase() === name.toLowerCase() || c.slug === slugify(name))
const authorName = (a: Named) => `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()
const findAuthor = (name: string) => authors.find((a) => authorName(a).toLowerCase() === name.toLowerCase() || a.slug === slugify(name))

const imageCache = new Map<string, string | null>()
async function uploadImage(url: string): Promise<string | null> {
  if (!client) return null
  if (imageCache.has(url)) return imageCache.get(url)!
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = basename(new URL(url).pathname) || 'image.jpg'
    const asset = await client.assets.upload('image', buffer, { filename, contentType: res.headers.get('content-type') ?? undefined })
    imageCache.set(url, asset._id)
    return asset._id
  } catch (error) {
    console.warn(`    ! could not download ${url}: ${(error as Error).message}`)
    imageCache.set(url, null)
    return null
  }
}

const docs: Record<string, unknown>[] = []
let skipped = 0
let problems = 0

for (const file of files) {
  const label = basename(file)
  const { data: fm, content } = matter(readFileSync(file, 'utf8'))
  const title = String(fm.title ?? '').trim()
  if (!title) {
    console.error(`✖ ${label}: missing "title" in the front matter — skipped`)
    problems++
    continue
  }
  const slug = slugify(String(fm.slug ?? title))
  if (existingSlugs.has(slug) && !update) {
    console.log(`– ${label}: "${slug}" already exists — skipped (use --update to overwrite)`)
    skipped++
    continue
  }

  const notes: string[] = []
  const body = await markdownToPortableText(content, {
    title,
    warn: (m) => notes.push(m),
    resolveImage: upload ? (url) => uploadImage(url) : undefined,
  })
  if (!body.length) {
    console.error(`✖ ${label}: the article body is empty — skipped`)
    problems++
    continue
  }

  // Category
  const categoryName = String(fm.category ?? '').trim()
  if (!categoryName) {
    console.error(`✖ ${label}: missing "category" — skipped`)
    problems++
    continue
  }
  let category = findCategory(categoryName)
  if (!category) {
    category = { _id: `category-${slugify(categoryName)}`, title: categoryName, slug: slugify(categoryName) }
    categories.push(category)
    docs.push({ _id: category._id, _type: 'category', title: categoryName, slug: { _type: 'slug', current: category.slug } })
    notes.push(`new category "${categoryName}" will be created`)
  }

  // Author
  const wanted = String(fm.author ?? defaultAuthor ?? '').trim()
  let author = wanted ? findAuthor(wanted) : authors[0]
  if (!author && offline && wanted) {
    author = { _id: `author-${slugify(wanted)}` }
    notes.push(`author "${wanted}" not checked (offline)`)
  }
  if (!author) {
    console.error(`✖ ${label}: author "${wanted || '(none)'}" not found — create the author in Studio first, or pass --author "Name" — skipped`)
    problems++
    continue
  }

  // Cover image
  const imageUrl = fm.image ? String(fm.image) : undefined
  const alt = String(fm.imageAlt ?? title)
  let mainImage: Record<string, unknown> | undefined
  if (imageUrl) {
    const assetId = upload ? await uploadImage(imageUrl) : null
    mainImage = assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt } : { externalUrl: imageUrl, alt }
  } else notes.push('no cover image')

  const publishedAt = fm.publishedAt ? new Date(fm.publishedAt as string).toISOString() : new Date().toISOString()
  const id = `${asDraft ? 'drafts.' : ''}import-${slug}`
  docs.push({
    _id: id,
    _type: 'post',
    title,
    slug: { _type: 'slug', current: slug },
    excerpt: String(fm.excerpt ?? fm.description ?? '').trim() || firstParagraphText(body as PtBlock[]),
    ...(mainImage ? { mainImage } : {}),
    category: { _type: 'reference', _ref: category._id },
    author: { _type: 'reference', _ref: author._id },
    publishedAt,
    ...(fm.updatedAt ? { updatedAt: new Date(fm.updatedAt as string).toISOString() } : {}),
    ...(fm.articleType ? { articleType: String(fm.articleType) } : {}),
    ...(Array.isArray(fm.keywords) ? { keywords: fm.keywords.map(String) } : {}),
    ...(fm.seoTitle ? { seoTitle: String(fm.seoTitle) } : {}),
    ...(fm.seoDescription ? { seoDescription: String(fm.seoDescription) } : {}),
    ...(fm.affiliateDisclosure ? { affiliateDisclosure: true } : {}),
    ...(fm.noIndex ? { noIndex: true } : {}),
    body,
  })
  existingSlugs.add(slug)
  console.log(`✔ ${label} → /${slug}${notes.length ? `   (${[...new Set(notes)].join('; ')})` : ''}`)
}

const posts = docs.filter((d) => d._type === 'post').length
console.log(`\n${posts} article(s) ready, ${skipped} skipped, ${problems} with problems.`)

if (ndjsonPath) {
  writeFileSync(ndjsonPath, docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
  console.log(`Wrote ${ndjsonPath} — import it with: npx sanity dataset import ${ndjsonPath} <dataset> --missing`)
} else if (dryRun) {
  console.log('Dry run — nothing was written.')
} else if (client && docs.length) {
  const fn = update ? 'createOrReplace' : 'createIfNotExists'
  let tx = client.transaction()
  for (const d of docs) tx = tx[fn](d as { _id: string; _type: string })
  await tx.commit()
  console.log(asDraft ? '✔ Saved as drafts — open Studio to review and publish them.' : '✔ Published. The site refreshes through the Sanity webhook.')
}
if (problems) process.exitCode = 1
