import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status })

/**
 * Contact form endpoint. Spam protection, in order:
 *  1. honeypot field and minimum fill-in time (bots get a fake "ok")
 *  2. link limit in the message
 *  3. Cloudflare Turnstile check when TURNSTILE_SECRET_KEY is set
 * Mail is sent with Resend (RESEND_API_KEY). Optional: CONTACT_FROM, e.g.
 * "Aquariumko <hello@aquariumko.com>" (the domain must be verified in Resend).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }

  const name = text(body.name, 100).replace(/[\r\n]+/g, ' ')
  const email = text(body.email, 200)
  const message = text(body.message, 5000)

  // Bots: pretend it worked so they do not retry.
  const tooFast = Number(body.elapsed) < 3000
  const links = (message.match(/https?:\/\//gi) || []).length
  if (text(body.website, 200) || tooFast || links > 3) return json({ ok: true })

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return json({ error: 'Please fill in your name, a valid email and a message of at least 10 characters.' }, 400)
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  if (turnstileSecret) {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: turnstileSecret, response: text(body.token, 2048) }),
    })
    const result = (await check.json().catch(() => ({}))) as { success?: boolean }
    if (!result.success) return json({ error: 'Spam check failed. Please reload the page and try again.' }, 400)
  }

  const apiKey = process.env.RESEND_API_KEY
  const settings = await getSettings()
  const to = settings.contactEmail
  if (!apiKey || !to) return json({ error: 'The contact form is not set up yet. Please email us instead.' }, 503)

  const from = process.env.CONTACT_FROM || `${settings.siteName} <onboarding@resend.dev>`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New message from ${name} via ${settings.siteName}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  })
  if (!res.ok) return json({ error: 'We could not send your message. Please email us instead.' }, 502)

  return json({ ok: true })
}
