/**
 * next/image loader for the whole site.
 *  - Sanity CDN images: resized + converted by Sanity (?w=…&auto=format).
 *  - Anything else (e.g. a pasted Unsplash URL): returned untouched.
 * No image-optimisation service or Cloudflare Images binding is needed.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('https://cdn.sanity.io/')) return src
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  if (!url.searchParams.has('fit')) url.searchParams.set('fit', 'max')
  return url.toString()
}
