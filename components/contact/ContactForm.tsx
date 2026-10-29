'use client'

import { useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const fieldClass =
  'w-full rounded-lg border border-surface-border bg-surface-base px-4 py-3 text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/40'

/**
 * Contact form with built-in spam protection: a hidden honeypot field, a
 * minimum-time check, link limits on the server, and optional Cloudflare
 * Turnstile when a site key is provided.
 */
export default function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const startedAt = useRef(Date.now())

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          website: data.get('website'),
          token: data.get('cf-turnstile-response'),
          elapsed: Date.now() - startedAt.current,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.')
      form.reset()
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="mt-10 rounded-xl border border-surface-border bg-surface-raised p-6 text-text-primary">
        Thank you. Your message has been sent and we will reply as soon as we can.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate={false}>
      <h2 className="font-heading font-bold text-2xl text-text-primary">Send us a message</h2>

      <div>
        <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-text-primary">Your name</label>
        <input id="cf-name" name="name" type="text" required maxLength={100} autoComplete="name" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-text-primary">Email address</label>
        <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-text-primary">Message</label>
        <textarea id="cf-message" name="message" required minLength={10} maxLength={5000} rows={6} className={fieldClass} />
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="cf-website">Leave this field empty</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
        </>
      )}

      {status === 'error' && (
        <p role="alert" className="text-sm font-medium text-red-600">{error}</p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn btn-accent">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
