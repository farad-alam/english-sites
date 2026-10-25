/**
 * Writes wrangler.jsonc for ONE site. The repo is shared by every site, so the
 * per-site bits (Worker name, cache store) come from environment variables:
 *
 *   CF_WORKER_NAME   required   e.g. "cozy-desk"  (also the name of the Worker in Cloudflare)
 *   CF_CACHE         optional   "r2" (default) or "kv" — where rendered pages are cached.
 *                               R2 needs R2 switched on for the account (payment method on file).
 *                               KV needs nothing extra, but has small free limits (fine for a test site).
 *   CF_ROUTE         optional   custom domain, e.g. "cozydesk.com" (adds www + apex routes)
 *   CF_ZONE_NAME     optional   the Cloudflare zone for CF_ROUTE (defaults to CF_ROUTE)
 *
 * Without CF_WORKER_NAME it writes a placeholder config so local builds still work.
 *
 * It also makes sure the cache store exists when Cloudflare credentials are
 * available (CLOUDFLARE_API_TOKEN) — safe to run repeatedly.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const rawName = process.env.CF_WORKER_NAME?.trim()
const name = (rawName || 'english-site').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 54)
const cacheName = `${name}-cache`
const useKv = process.env.CF_CACHE?.trim().toLowerCase() === 'kv'
const route = process.env.CF_ROUTE?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
const zone = process.env.CF_ZONE_NAME?.trim() || route?.replace(/^www\./, '')

const API = 'https://api.cloudflare.com/client/v4'

async function cf<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const json = (await res.json()) as { success: boolean; result: T; errors?: { code: number; message: string }[] }
  if (!json.success) throw new Error(`Cloudflare API ${path}: ${(json.errors ?? []).map((e) => `${e.code} ${e.message}`).join('; ') || res.status}`)
  return json.result
}

/** Finds the KV namespace with this title, or creates it. Returns its id. */
async function ensureKvNamespace(token: string, title: string): Promise<string> {
  let account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  if (!account) {
    const accounts = await cf<{ id: string }[]>(token, '/accounts')
    if (accounts.length !== 1) throw new Error('Set CLOUDFLARE_ACCOUNT_ID (the token can see more than one account).')
    account = accounts[0].id
  }
  const base = `/accounts/${account}/storage/kv/namespaces`
  for (let page = 1; page <= 20; page++) {
    const batch = await cf<{ id: string; title: string }[]>(token, `${base}?per_page=100&page=${page}`)
    const found = batch.find((n) => n.title === title)
    if (found) return found.id
    if (batch.length < 100) break
  }
  const created = await cf<{ id: string }>(token, base, { method: 'POST', body: JSON.stringify({ title }) })
  return created.id
}

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
  // Cache-tag bookkeeping for on-demand revalidation
  durable_objects: { bindings: [{ name: 'NEXT_TAG_CACHE_DO_SHARDED', class_name: 'DOShardedTagCache' }] },
  migrations: [{ tag: 'v1', new_sqlite_classes: ['DOShardedTagCache'] }],
}

const token = process.env.CLOUDFLARE_API_TOKEN?.trim()

if (useKv) {
  // Cached pages in Workers KV. wrangler needs the namespace id to fill the cache at deploy time.
  let id: string | undefined
  if (rawName && token) {
    try {
      id = await ensureKvNamespace(token, cacheName)
      console.log(`KV namespace "${cacheName}" ready`)
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      console.error(`Could not find or create KV namespace "${cacheName}". Create it in the Cloudflare dashboard (Workers KV) and re-run.`)
      process.exitCode = 1
    }
  } else if (rawName) {
    console.log(`Skipping KV namespace creation (no CLOUDFLARE_API_TOKEN). Make sure namespace "${cacheName}" exists before deploying.`)
  }
  config.kv_namespaces = [{ binding: 'NEXT_INC_CACHE_KV', ...(id ? { id } : {}) }]
} else {
  // Cached pages in R2
  config.r2_buckets = [{ binding: 'NEXT_INC_CACHE_R2_BUCKET', bucket_name: cacheName }]
}

if (route) {
  const apex = route.replace(/^www\./, '')
  config.routes = [
    { pattern: apex, custom_domain: true, ...(zone ? { zone_name: zone } : {}) },
    { pattern: `www.${apex}`, custom_domain: true, ...(zone ? { zone_name: zone } : {}) },
  ]
}

writeFileSync(join(process.cwd(), 'wrangler.jsonc'), JSON.stringify(config, null, 2) + '\n')

// Tell open-next.config.ts which store to use. It has to be a build-time constant
// (the deployed Worker does not see build variables), so it goes in a tiny module.
const cacheModule = `// Which store holds the rendered pages: 'r2' (default) or 'kv'.
// Rewritten by scripts/generate-wrangler.ts from the CF_CACHE environment variable
// (a build-time constant, so the deployed Worker needs no runtime variable). Don't edit by hand.
export const cacheStore: 'r2' | 'kv' = '${useKv ? 'kv' : 'r2'}'
`
const cachePath = join(process.cwd(), 'open-next.cache.ts')
let currentCacheModule = ''
try {
  currentCacheModule = readFileSync(cachePath, 'utf8')
} catch {
  /* missing: written below */
}
if (currentCacheModule !== cacheModule) writeFileSync(cachePath, cacheModule)
console.log(
  `wrangler.jsonc written for Worker "${name}" (${useKv ? 'KV' : 'R2'} cache)${rawName ? '' : ' (placeholder — set CF_WORKER_NAME for a real site)'}`,
)

// Create the R2 bucket if we are able to (idempotent).
if (!useKv) {
  if (rawName && token) {
    const res = spawnSync('npx', ['wrangler', 'r2', 'bucket', 'create', cacheName], { encoding: 'utf8' })
    const out = `${res.stdout}${res.stderr}`
    if (res.status === 0) console.log(`R2 bucket "${cacheName}" created`)
    else if (/already exists|10004/i.test(out)) console.log(`R2 bucket "${cacheName}" already exists`)
    else {
      console.error(out)
      console.error(`Could not create R2 bucket "${cacheName}". Turn on R2 in the Cloudflare dashboard (or set CF_CACHE=kv) and re-run.`)
      process.exitCode = 1
    }
  } else if (rawName) {
    console.log(`Skipping R2 bucket creation (no CLOUDFLARE_API_TOKEN). Make sure bucket "${cacheName}" exists before deploying.`)
  }
}
