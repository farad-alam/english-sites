import { createClient } from 'next-sanity'
import { HAS_SANITY, SANITY_DATASET, SANITY_PROJECT_ID } from '@/lib/config'

export const apiVersion = '2025-01-01'

/**
 * Read client. useCdn is off on purpose: Next.js already caches every response
 * (tag-based ISR), and a CDN in front of Sanity could serve stale data right
 * after the webhook fires.
 */
// SANITY_API_HOST is for local testing only (scripts/dev/mock-sanity.ts serves demo data from memory).
const apiHost = process.env.SANITY_API_HOST

export const client = createClient({
  projectId: SANITY_PROJECT_ID || 'unconfigured',
  dataset: SANITY_DATASET,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
})

/**
 * Cached fetch. Pages stay cached indefinitely (revalidate: false) until the
 * Sanity webhook expires the matching tags — see app/api/revalidate/route.ts.
 * Errors are deliberately NOT swallowed: if Sanity is down during a
 * revalidation, Next keeps serving the last good page instead of caching an
 * empty one.
 */
export async function sanityFetch<T>(opts: {
  query: string
  params?: Record<string, unknown>
  tags: string[]
  /** Returned when no Sanity project is connected yet */
  fallback: T
}): Promise<T> {
  if (!HAS_SANITY) return opts.fallback
  return client.fetch<T>(opts.query, opts.params ?? {}, {
    next: { revalidate: false, tags: opts.tags },
  })
}
