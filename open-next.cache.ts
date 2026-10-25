// Which store holds the rendered pages: 'r2' (default) or 'kv'.
// Rewritten by scripts/generate-wrangler.ts from the CF_CACHE environment variable
// (a build-time constant, so the deployed Worker needs no runtime variable). Don't edit by hand.
export const cacheStore: 'r2' | 'kv' = 'r2'
