// Kept dependency-free: it is imported by the Sanity Studio schemas as well as the app.
/** Slugs that article URLs must not use (they are real routes). */
export const RESERVED_SLUGS = [
  'about',
  'privacy',
  'terms',
  'disclosure',
  'contact',
  'blog',
  'search',
  'offers',
  'category',
  'authors',
  'go',
  'studio',
  'api',
  'sitemap',
  'sitemap.xml',
  'robots.txt',
  'ads.txt',
  'search-index.json',
  '_next',
] as const
