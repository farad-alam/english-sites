import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'
import type { SanityImageValue } from './types'

const builder = createImageUrlBuilder(client)

/** Sanity image-URL builder (handles hotspot + crop automatically). */
export function urlFor(source: SanityImageValue) {
  return builder.image(source as Parameters<typeof builder.image>[0])
}

export function hasImage(image: SanityImageValue | null | undefined): boolean {
  return Boolean(image && (image.externalUrl || image.asset?._ref))
}

/**
 * A displayable URL for any image shape. Uploaded images go through Sanity's
 * image CDN (resized + WebP/AVIF); `externalUrl` is returned as-is.
 * Pass width + height + crop for an exact-size crop (e.g. og:image 1200×630).
 */
export function getImageUrl(
  image: SanityImageValue | null | undefined,
  opts: { width?: number; height?: number; crop?: boolean; format?: 'jpg' | 'webp' } = {},
): string | undefined {
  if (!image) return undefined
  if (image.asset?._ref) {
    let b = urlFor(image)
    if (opts.width) b = b.width(opts.width)
    if (opts.height) b = b.height(opts.height)
    if (opts.crop && opts.width && opts.height) b = b.fit('crop')
    if (opts.format) b = b.format(opts.format)
    else b = b.auto('format')
    return b.url()
  }
  return image.externalUrl?.replace(/^http:\/\//, 'https://')
}

/** Base URL for next/image — the custom loader adds ?w= for each breakpoint. */
export function getBaseImageUrl(image: SanityImageValue | null | undefined): string | undefined {
  if (!image) return undefined
  if (image.asset?._ref) return urlFor(image).url()
  return image.externalUrl?.replace(/^http:\/\//, 'https://')
}

/** CSS object-position from the Sanity hotspot, so crops keep the subject. */
export function hotspotPosition(image: SanityImageValue | null | undefined): string | undefined {
  const h = image?.hotspot
  if (!h) return undefined
  return `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%`
}
