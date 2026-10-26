'use client'

import dynamic from 'next/dynamic'

// Client-only on purpose: keeps the heavy Studio code out of the server (Worker) bundle.
const Studio = dynamic(() => import('./Studio'), {
  ssr: false,
  loading: () => <p style={{ padding: 24, fontFamily: 'system-ui', color: '#cfd2d6' }}>Loading Studio…</p>,
})

// The Studio covers the whole window, so the public site's header and footer never show around it.
export default function StudioLoader() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#101112', overflow: 'hidden' }}>
      <Studio />
    </div>
  )
}
