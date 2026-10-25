import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

type WebhookBody = {
  _type?: string
  _id?: string
  slug?: string
  categoryId?: string
  /** Values before the edit (so a renamed slug or a moved article also refreshes its old pages) */
  prevSlug?: string
  prevCategoryId?: string
}

/** Expire a cache tag immediately (Next 16 takes a cache profile as the second argument). */
const expire = (tag: string) => revalidateTag(tag, { expire: 0 })

/**
 * Sanity webhook → on-demand revalidation.
 *
 * In Sanity → API → Webhooks → Create webhook:
 *   URL        https://<your-site>/api/revalidate
 *   Trigger on Create, Update, Delete
 *   Projection { _type, _id, "slug": slug.current, "categoryId": category._ref,
 *                "prevSlug": before().slug.current, "prevCategoryId": before().category._ref }
 *   Secret     the same value as SANITY_WEBHOOK_SECRET
 *   Drafts     off
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'SANITY_WEBHOOK_SECRET is not set' }, { status: 500 })

  let body: WebhookBody | null
  try {
    const parsed = await parseBody<WebhookBody>(req, secret)
    if (!parsed.isValidSignature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    body = parsed.body
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body?._type) return NextResponse.json({ error: 'Missing _type' }, { status: 400 })

  const { _type: type, slug, categoryId, prevSlug, prevCategoryId } = body

  switch (type) {
    case 'post':
      expire('posts') // home, /blog, search index, sitemap
      if (categoryId) expire(`category:${categoryId}`) // category page + related posts
      if (prevCategoryId && prevCategoryId !== categoryId) expire(`category:${prevCategoryId}`) // article moved out of a category
      if (slug) expire(`post:${slug}`)
      else revalidatePath('/[slug]', 'page') // delete events carry no slug → refresh all articles
      if (prevSlug && prevSlug !== slug) expire(`post:${prevSlug}`) // slug changed: the old URL must now 404
      break
    case 'category':
      expire('categories')
      expire('posts')
      break
    case 'author':
      expire('authors')
      break
    case 'offer':
      expire('offers')
      if (prevSlug && prevSlug !== slug) expire(`offer:${prevSlug}`)
      if (slug) expire(`offer:${slug}`)
      else revalidatePath('/offers/[slug]', 'page')
      break
    case 'affiliateLink':
      expire('affiliateLinks')
      break
    case 'staticPage':
      expire('staticPages')
      break
    case 'siteSettings':
      expire('siteSettings') // every page reads the settings → whole site refreshes lazily
      break
    default:
      return NextResponse.json({ ok: true, ignored: type })
  }

  return NextResponse.json({ ok: true, revalidated: type, at: new Date().toISOString() })
}
