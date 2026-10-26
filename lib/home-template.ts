// Kept dependency-free: it is imported by the Sanity Studio schema as well as the app.

/**
 * THE BUILT-IN HOME PAGE
 *
 * Every new site gets this layout, top to bottom, with nothing to set up:
 *
 *   Hero → Trending articles → Recently published → Featured articles
 *
 * (the header menu and footer wrap it, see lib/nav.ts)
 *
 * It is used in two places, so a site looks the same either way:
 *   - Studio: Site Settings → Home page starts pre-filled with these blocks, ready to edit,
 *     reorder, hide or extend with the section library.
 *   - The app: a site whose Home page list is still empty renders the same blocks (minus the hidden one).
 *
 * Trending and Featured stay invisible until the owner picks articles for them, and
 * Featured is switched off by default because a brand-new site has no money articles yet.
 */
export const DEFAULT_HOME_SECTIONS = [
  { _type: 'heroSection', _key: 'tpl-hero', variant: 'centered', overlay: 'medium', showSearch: true, showTopics: true },
  { _type: 'trendingPostsSection', _key: 'tpl-trending', title: 'Trending articles' },
  { _type: 'latestPostsSection', _key: 'tpl-latest', title: 'Recently published', count: 6, showViewAll: true },
  { _type: 'featuredPostsSection', _key: 'tpl-featured', title: 'Featured articles', disabled: true },
]
