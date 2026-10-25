import { getSettings } from '@/lib/settings'

export const dynamic = 'force-static'
export const revalidate = false

/** /ads.txt built from Site Settings — required by AdSense to authorise your site. */
export async function GET() {
  const settings = await getSettings()
  const lines: string[] = []
  const client = settings.ads.adsenseClientId
  if (client) lines.push(`google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`)
  if (settings.ads.extraAdsTxt) lines.push(...settings.ads.extraAdsTxt.split('\n').map((l) => l.trim()).filter(Boolean))
  if (!lines.length) return new Response('Not found', { status: 404 })
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
