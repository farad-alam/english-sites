import type { Metadata } from 'next'
import StudioLoader from './StudioLoader'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return <StudioLoader />
}
