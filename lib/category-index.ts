/**
 * True when a category page may appear in Google: the site owner has set a minimum article count
 * (Site Settings, SEO tab; 0 or empty means never) and the category has reached it.
 * Shared by the category page and the sitemaps so they always agree.
 */
export function isCategoryIndexable(total: number, minPosts: number | null | undefined): boolean {
  const min = Number(minPosts) || 0
  return min > 0 && total > 0 && total >= min
}
