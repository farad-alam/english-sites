'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface Props {
  client: string
  slot: string
  className?: string
}

/** One AdSense display unit. Space is reserved (see .ad-box) so a late ad never shifts the page. */
export default function AdSlot({ client, slot, className = '' }: Props) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* blocked by an ad blocker or script not loaded — nothing to do */
    }
  }, [])

  return (
    <aside aria-label="Advertisement" className={`ad-box my-8 flex flex-col items-center ${className}`}>
      <span className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Advertisement</span>
      <ins
        className="adsbygoogle w-full"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
