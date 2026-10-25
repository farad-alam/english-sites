import Image from 'next/image'
import { getBaseImageUrl, hotspotPosition } from '@/sanity/image'
import type { SanityImageValue } from '@/sanity/types'

interface Props {
  image: SanityImageValue | null | undefined
  /** Falls back to the image's own alt text. Use "" for purely decorative images. */
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Responsive image that fills its (relatively positioned) parent.
 * Renders nothing when there is no image, so callers choose their own placeholder.
 */
export default function SanityImage({ image, alt, className = '', sizes = '(min-width: 1024px) 400px, 100vw', priority }: Props) {
  const src = getBaseImageUrl(image)
  if (!src) return null
  // Images that are not on the Sanity CDN (a pasted URL) cannot be resized, so serve them as-is.
  const external = !src.startsWith('https://cdn.sanity.io/')
  return (
    <Image
      src={src}
      alt={alt ?? image?.alt ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={external}
      className={`object-cover ${className}`}
      style={{ objectPosition: hotspotPosition(image) }}
    />
  )
}

export { hasImage } from '@/sanity/image'
