'use client'

import dynamic from 'next/dynamic'

// Client-only on purpose: keeps the heavy Studio code out of the server (Worker) bundle.
const Studio = dynamic(() => import('./Studio'), {
  ssr: false,
  loading: () => <p style={{ padding: 24, fontFamily: 'system-ui' }}>Loading Studio…</p>,
})

export default function StudioLoader() {
  return <Studio />
}
