/** Shared by the scripts that write to Sanity (seed, bulk-import). */
import { config as loadEnv } from 'dotenv'
import { createClient, type SanityClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

export function adminClient(): SanityClient {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
  const token = process.env.SANITY_WRITE_TOKEN
  if (!projectId) fail('Set NEXT_PUBLIC_SANITY_PROJECT_ID (in .env.local) to the Sanity project you want to write to.')
  if (!token) {
    fail(
      'Set SANITY_WRITE_TOKEN in .env.local — create one in Sanity → API → Tokens with the "Editor" role.\n' +
        'Keep it local: never add it to Cloudflare or commit it.',
    )
  }
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2025-01-01',
    useCdn: false,
    ...(process.env.SANITY_API_HOST ? { apiHost: process.env.SANITY_API_HOST, useProjectHostname: false } : {}),
  })
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

export function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}
