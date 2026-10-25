/**
 * Deployment-level configuration. These are the ONLY values that come from
 * environment variables — everything else about a site (name, country, theme,
 * modules, ad IDs…) is edited in Sanity → Site Settings.
 */
export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/** False until a Sanity project is connected — the site then renders its built-in empty state. */
export const HAS_SANITY = Boolean(SANITY_PROJECT_ID)

export const PAGE_SIZE = 12
