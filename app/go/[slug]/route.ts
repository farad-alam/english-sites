import { destinationOf } from '@/lib/affiliates'
import { getSettings } from '@/lib/settings'
import { getAffiliateLink } from '@/sanity/queries'

/**
 * /go/<slug> → the real affiliate URL (302). Keeps raw affiliate URLs out of the
 * articles, lets you change a destination in one place, and is disallowed in robots.txt.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const settings = await getSettings()
  if (!settings.modules.affiliate) return new Response('Not found', { status: 404 })

  const link = await getAffiliateLink(slug)
  const destination = link ? destinationOf(link, settings) : undefined
  if (!destination) return new Response('Not found', { status: 404 })

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  })
}
