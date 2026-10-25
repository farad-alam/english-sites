'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'

interface Props {
  title: string
  url: string
  twitterHandle?: string
}

const btn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-3 rounded-xl border border-surface-border bg-surface-card text-text-primary text-sm font-medium transition-all active:scale-[0.97] hover:border-brand-primary/40 hover:text-brand-primary'

const subscribeNoop = () => () => {}
const nativeShareSupported = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function ShareButtons({ title, url, twitterHandle }: Props) {
  const [copied, setCopied] = useState(false)
  const canNativeShare = useSyncExternalStore(subscribeNoop, nativeShareSupported, () => false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const via = twitterHandle?.replace(/^@/, '').trim()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section aria-label="Share this article" className="my-8 md:my-10 py-5 border-t border-b border-surface-border">
      <p className="font-heading font-bold text-text-primary text-base mb-3">Share this article</p>

      {canNativeShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          className="md:hidden w-full mb-3 btn btn-primary !min-h-[52px]"
        >
          <Share2 size={18} /> Share
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" className={btn}>WhatsApp</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={btn}>Facebook</a>
        <a href={`https://x.com/intent/tweet?text=${t}&url=${u}${via ? `&via=${encodeURIComponent(via)}` : ''}`} target="_blank" rel="noopener noreferrer" className={btn}>X</a>
        <button type="button" onClick={copy} className={btn} aria-live="polite">
          {copied ? (<><Check size={17} /> Copied!</>) : (<><Link2 size={17} /> Copy link</>)}
        </button>
      </div>
    </section>
  )
}
