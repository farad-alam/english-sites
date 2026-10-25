import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue'
import shardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'
import { cacheStore } from './open-next.cache'

/**
 * Every site runs the same build. These pieces make cached pages and on-demand
 * revalidation (the Sanity webhook) work on Cloudflare Workers:
 *   - R2 bucket or KV    stores the rendered pages (CF_CACHE picks which; created by `npm run cf:config`)
 *   - Durable Objects    remember which cache tags the webhook has invalidated
 *                        (no database to create — declared in the generated wrangler.jsonc)
 *   - memory queue       background revalidation (rarely used: pages only change on webhook)
 */
export default defineCloudflareConfig({
  incrementalCache: cacheStore === 'kv' ? kvIncrementalCache : r2IncrementalCache,
  tagCache: shardedTagCache({ baseShardSize: 4, regionalCache: true, regionalCacheTtlSec: 5 }),
  queue: memoryQueue,
})
