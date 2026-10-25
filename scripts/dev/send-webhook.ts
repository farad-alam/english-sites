/**
 * Sends a correctly signed fake Sanity webhook to a site — handy for checking
 * that /api/revalidate and your SANITY_WEBHOOK_SECRET are set up properly.
 *
 *   SANITY_WEBHOOK_SECRET=… npx tsx scripts/dev/send-webhook.ts https://your-site.com '{"_type":"post","slug":"my-post"}'
 */
import { encodeSignatureHeader } from '@sanity/webhook'

const [site, json = '{"_type":"siteSettings"}'] = process.argv.slice(2)
const secret = process.env.SANITY_WEBHOOK_SECRET
if (!site || !secret) {
  console.error('Usage: SANITY_WEBHOOK_SECRET=… tsx scripts/dev/send-webhook.ts <site-url> [json-body]')
  process.exit(1)
}

const signature = await encodeSignatureHeader(json, Date.now(), secret)
const res = await fetch(`${site.replace(/\/$/, '')}/api/revalidate`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'sanity-webhook-signature': signature },
  body: json,
})
console.log(res.status, await res.text())
