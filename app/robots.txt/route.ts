import { BASE_URL } from '@/lib/config'

export const dynamic = 'force-static'
export const revalidate = false

export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /studio',
    'Disallow: /api/',
    'Disallow: /go/',
    'Disallow: /search',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
  ]
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
