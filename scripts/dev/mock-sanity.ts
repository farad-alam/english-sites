/**
 * A tiny in-memory stand-in for the Sanity Content Lake query API, for testing
 * this site offline: it serves the demo dataset and evaluates real GROQ with
 * groq-js, so the queries in sanity/queries.ts are exercised for real.
 *
 *   npx tsx scripts/dev/mock-sanity.ts            # listens on :4455
 *   SANITY_API_HOST=http://localhost:4455 NEXT_PUBLIC_SANITY_PROJECT_ID=demo npm run build
 *
 * It mimics the "published" perspective (drafts are hidden) and logs each query.
 */
import { createServer } from 'node:http'
import { evaluate, parse } from 'groq-js'
import { buildDemoDataset } from './demo-data'

const PORT = Number(process.env.MOCK_SANITY_PORT ?? 4455)

type Doc = Record<string, unknown> & { _id: string }
// MOCK_EMPTY=1 serves an empty dataset — what a brand-new Sanity project looks like.
const dataset = (process.env.MOCK_EMPTY ? [] : buildDemoDataset()) as Doc[]
// Published perspective: hide drafts.
let published = dataset.filter((d) => !d._id.startsWith('drafts.'))
const stats = { queries: 0, errors: 0 }

async function run(query: string, params: Record<string, unknown>) {
  const tree = parse(query, { params })
  const value = await evaluate(tree, { dataset: published, params, timestamp: new Date() })
  return value.get()
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => resolve(data))
  })
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const send = (status: number, body: unknown) => {
    res.writeHead(status, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  }

  if (url.pathname === '/__stats') return send(200, stats)
  // Test helper: POST /__upsert with a document (replaces by _id) or /__delete?id=…, to simulate editing in Studio.
  if (url.pathname === '/__upsert' && req.method === 'POST') {
    const doc = JSON.parse(await readBody(req)) as Doc
    published = [...published.filter((d) => d._id !== doc._id), doc]
    return send(200, { ok: true, count: published.length })
  }
  if (url.pathname === '/__delete') {
    const id = url.searchParams.get('id')
    published = published.filter((d) => d._id !== id)
    return send(200, { ok: true, count: published.length })
  }
  if (!/\/data\/query\//.test(url.pathname)) return send(404, { error: 'not found' })

  let query = url.searchParams.get('query') ?? ''
  const params: Record<string, unknown> = {}
  for (const [key, value] of url.searchParams) {
    if (key.startsWith('$')) params[key.slice(1)] = JSON.parse(value)
  }
  if (req.method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}') as { query?: string; params?: Record<string, unknown> }
    query = body.query ?? query
    Object.assign(params, body.params ?? {})
  }

  stats.queries++
  try {
    const started = Date.now()
    const result = await run(query, params)
    console.log(`[mock-sanity] ${Date.now() - started}ms  ${query.replace(/\s+/g, ' ').slice(0, 110)}`)
    send(200, { ms: Date.now() - started, query, result })
  } catch (error) {
    stats.errors++
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[mock-sanity] ERROR ${message}\n   query: ${query.replace(/\s+/g, ' ').slice(0, 300)}`)
    send(400, { error: { description: message, type: 'queryParseError' } })
  }
}).listen(PORT, () => console.log(`[mock-sanity] serving ${published.length} documents on http://localhost:${PORT}`))
