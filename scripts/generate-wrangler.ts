/**
 * Writes wrangler.jsonc for ONE site. The repo is shared by every site, so the
 * per-site bits (Worker name, bucket) come from environment variables:
 *
 *   CF_WORKER_NAME   required   e.g. "cozy-desk"  (also the name of the Worker in Cloudflare)
 *   CF_ROUTE         optional   custom domain, e.g. "cozydesk.com" (adds www + apex routes)
 *   CF_ZONE_NAME     optional   the Cloudflare zone for CF_ROUTE (defaults to CF_ROUTE)
 *
 * Without CF_WORKER_NAME it writes a placeholder config so local builds still work.
 *
 * It also makes sure the R2 bucket exists when Cloudflare credentials are
 * available (CLOUDFLARE_API_TOKEN) — safe to run repeatedly.
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const rawName = process.env.CF_WORKER_NAME?.trim()
const name = (rawName || 'english-site').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 54)
const bucket = `${name}-cache`
const route = process.env.CF_ROUTE?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
const zone = process.env.CF_ZONE_NAME?.trim() || route?.replace(/^www\./, '')

const config: Record<string, unknown> = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name,
  main: '.open-next/worker.js',
  compatibility_date: '2026-08-01',
  compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
  assets: { directory: '.open-next/assets', binding: 'ASSETS' },
  observability: { enabled: true },
  // Lets the Worker call itself (background revalidation)
  services: [{ binding: 'WORKER_SELF_REFERENCE', service: name }],
  // Cached pages
  r2_buckets: [{ binding: 'NEXT_INC_CACHE_R2_BUCKET', bucket_name: bucket }],
  // Cache-tag bookkeeping for on-demand revalidation
  durable_objects: { bindings: [{ name: 'NEXT_TAG_CACHE_DO_SHARDED', class_name: 'DOShardedTagCache' }] },
  migrations: [{ tag: 'v1', new_sqlite_classes: ['DOShardedTagCache'] }],
}

if (route) {
  const apex = route.replace(/^www\./, '')
  config.routes = [
    { pattern: apex, custom_domain: true, ...(zone ? { zone_name: zone } : {}) },
    { pattern: `www.${apex}`, custom_domain: true, ...(zone ? { zone_name: zone } : {}) },
  ]
}

writeFileSync(join(process.cwd(), 'wrangler.jsonc'), JSON.stringify(config, null, 2) + '\n')
console.log(`wrangler.jsonc written for Worker "${name}"${rawName ? '' : ' (placeholder — set CF_WORKER_NAME for a real site)'}`)

// Create the R2 bucket if we are able to (idempotent).
if (rawName && process.env.CLOUDFLARE_API_TOKEN) {
  const res = spawnSync('npx', ['wrangler', 'r2', 'bucket', 'create', bucket], { encoding: 'utf8' })
  const out = `${res.stdout}${res.stderr}`
  if (res.status === 0) console.log(`R2 bucket "${bucket}" created`)
  else if (/already exists|10004/i.test(out)) console.log(`R2 bucket "${bucket}" already exists`)
  else {
    console.error(out)
    console.error(`Could not create R2 bucket "${bucket}". Create it in the Cloudflare dashboard (R2) and re-run.`)
    process.exitCode = 1
  }
} else if (rawName) {
  console.log(`Skipping R2 bucket creation (no CLOUDFLARE_API_TOKEN). Make sure bucket "${bucket}" exists before deploying.`)
}
