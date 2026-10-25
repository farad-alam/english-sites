import { absoluteUrl, escapeXml } from './format'

export interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: number
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export function urlset(entries: SitemapEntry[]): Response {
  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(e.path))}</loc>` +
        (e.lastmod ? `\n    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : '') +
        (e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '') +
        (e.priority !== undefined ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : '') +
        `\n  </url>`,
    )
    .join('\n')
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`)
}

export function sitemapIndex(paths: string[]): Response {
  const now = new Date().toISOString().slice(0, 10)
  const body = paths.map((p) => `  <sitemap>\n    <loc>${escapeXml(absoluteUrl(p))}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`).join('\n')
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`)
}
