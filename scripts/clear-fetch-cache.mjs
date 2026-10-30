/**
 * Runs before every build (see package.json "cf:build").
 *
 * Next.js keeps fetched data in .next/cache/fetch-cache, and Cloudflare's build
 * cache restores that folder between builds. Sanity queries are cached with
 * revalidate: false (they never expire), so without this step every build would
 * re-use the answers saved by the very first build, often an empty dataset, and
 * pre-render pages with placeholder content ("My Site", no articles).
 *
 * Only the data cache is removed. The compiler cache stays, so builds stay fast.
 * Live pages are still served from the page cache and only re-render when the
 * Sanity webhook marks them as changed.
 */
import { rmSync } from 'node:fs'

rmSync('.next/cache/fetch-cache', { recursive: true, force: true })
console.log('Cleared .next/cache/fetch-cache so this build reads fresh content from Sanity')
