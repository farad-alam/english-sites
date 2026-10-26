import { defineArrayMember, defineField, defineType } from 'sanity'
import { COUNTRIES } from '../../lib/country'
import { FONT_OPTIONS } from '../../lib/fonts'
import { DEFAULT_HOME_SECTIONS } from '../../lib/home-template'
import { THEME_PRESETS } from '../../lib/theme'

const HEX = /^#[0-9a-fA-F]{6}$/
const collapsible = { collapsible: true, collapsed: false }

const COUNTRY_OPTIONS = Object.values(COUNTRIES).map((c) => ({ title: `${c.flag} ${c.label}`, value: c.code }))

/**
 * SITE SETTINGS — the one document that turns this codebase into a specific site.
 * Deploying the same repo to a new Cloudflare Worker + a new Sanity project and
 * filling this in is all it takes to launch another site.
 */
export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'identity', title: '1 · Identity', default: true },
    { name: 'modules', title: '2 · Modules' },
    { name: 'theme', title: '3 · Theme' },
    { name: 'navigation', title: '4 · Menu & footer' },
    { name: 'home', title: '5 · Home page' },
    { name: 'money', title: '6 · Ads & affiliate' },
    { name: 'analytics', title: '7 · Analytics' },
    { name: 'seo', title: '8 · SEO' },
  ],
  fields: [
    // ── 1. Identity ─────────────────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      group: 'identity',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'identity',
      description: 'One short line. Used as the default meta description if you do not set one in the SEO tab.',
      validation: (r) => r.max(160),
    }),
    defineField({
      name: 'country',
      title: 'Target country',
      type: 'string',
      group: 'identity',
      description:
        'The one country this site is written for. It sets the page language (en-US / en-GB / …), spelling of the default legal text, date format, and which Amazon store ASIN links point to.',
      options: { list: COUNTRY_OPTIONS, layout: 'radio' },
      initialValue: 'en-US',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'identity',
      description: 'Optional. Without a logo the site name is shown as text. SVG or PNG with a transparent background works best.',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'logoHeight',
      title: 'Logo height (px)',
      type: 'number',
      group: 'identity',
      initialValue: 36,
      validation: (r) => r.min(20).max(80),
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'identity',
      description: 'Square PNG, at least 192×192 px.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'identity',
      description: 'Shown on the Contact page and in the default Privacy Policy.',
      validation: (r) => r.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'email' }).error('Enter a valid email address'),
    }),

    // ── 2. Modules ──────────────────────────────────────────────────────────
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'object',
      group: 'modules',
      description:
        'Switch features on or off per site. A disabled module disappears from the menu, the sitemap and the home page — and its URLs return 404.',
      options: collapsible,
      fields: [
        defineField({
          name: 'blog',
          title: 'Blog — articles, categories, authors, search',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'affiliate',
          title: 'Affiliate — product reviews, tracked /go/ links, disclosure, Top Picks',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'offers',
          title: 'Offers — software / hosting / digital-product pages with deals',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    // ── 3. Theme ────────────────────────────────────────────────────────────
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'object',
      group: 'theme',
      options: collapsible,
      fields: [
        defineField({
          name: 'preset',
          title: 'Colour preset',
          type: 'string',
          options: { list: Object.entries(THEME_PRESETS).map(([value, p]) => ({ title: p.label, value })) },
          initialValue: 'emerald',
        }),
        defineField({
          name: 'primary',
          title: 'Primary colour (optional override)',
          type: 'string',
          description: 'Hex such as #0f766e. Leave empty to use the preset. Pick a colour dark enough for white text.',
          validation: (r) => r.custom((v) => (!v || HEX.test(String(v)) ? true : 'Use a 6-digit hex like #0f766e')),
        }),
        defineField({
          name: 'accent',
          title: 'Accent colour (optional override)',
          type: 'string',
          description: 'Used for buy / deal buttons. Hex such as #f59e0b.',
          validation: (r) => r.custom((v) => (!v || HEX.test(String(v)) ? true : 'Use a 6-digit hex like #f59e0b')),
        }),
        defineField({
          name: 'headingFont',
          title: 'Heading font',
          type: 'string',
          options: { list: FONT_OPTIONS.map((f) => ({ title: f.label, value: f.id })) },
          initialValue: 'inter',
        }),
        defineField({
          name: 'bodyFont',
          title: 'Body font',
          type: 'string',
          options: { list: FONT_OPTIONS.map((f) => ({ title: f.label, value: f.id })) },
          initialValue: 'inter',
        }),
        defineField({
          name: 'radius',
          title: 'Corner style',
          type: 'string',
          options: {
            list: [
              { title: 'Sharp', value: 'sharp' },
              { title: 'Soft (default)', value: 'soft' },
              { title: 'Round', value: 'round' },
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'soft',
        }),
      ],
    }),

    // ── 4. Menu & footer ────────────────────────────────────────────────────
    defineField({
      name: 'nav',
      title: 'Header menu',
      type: 'object',
      group: 'navigation',
      options: collapsible,
      description:
        'Leave "Menu items" empty and the menu is simply all your categories, kept up to date automatically. Add items only if you want something different: for example a Contact link, or a custom order. Drag items to reorder.',
      fields: [
        defineField({
          name: 'items',
          title: 'Menu items (empty = all categories, automatic)',
          type: 'array',
          description:
            'To add a link AND keep every category: add "All categories (automatic)" first, then your extra links. Drag them into the order you like.',
          of: [
            defineArrayMember({ type: 'autoCategories' }),
            defineArrayMember({ type: 'categoryLink' }),
            defineArrayMember({ type: 'pageLink' }),
            defineArrayMember({ type: 'navLink' }),
          ],
        }),
        defineField({
          name: 'maxVisible',
          title: 'Items shown in the bar',
          type: 'number',
          description: 'Anything beyond this moves into a "More" drop-down so the bar never overflows. Lower it if your category names are long.',
          initialValue: 6,
          validation: (r) => r.min(3).max(10).integer(),
        }),
        defineField({ name: 'ctaLabel', title: 'Menu button label (optional)', type: 'string' }),
        defineField({ name: 'ctaHref', title: 'Menu button link', type: 'string' }),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'navigation',
      options: collapsible,
      description:
        'Leave "Columns" empty for the standard footer: Categories, Quick Links (About, Contact, Affiliate Disclosure, Privacy, Terms) and Contact. Add columns to take full control; drag columns and links to reorder.',
      fields: [
        defineField({
          name: 'style',
          title: 'Look',
          type: 'string',
          options: { list: [{ title: 'Brand colour (white text)', value: 'brand' }, { title: 'Light', value: 'light' }], layout: 'radio', direction: 'horizontal' },
          initialValue: 'brand',
        }),
        defineField({ name: 'blurb', title: 'About text under the logo', type: 'text', rows: 3, description: 'Empty = the site tagline.', validation: (r) => r.max(300) }),
        defineField({
          name: 'columns',
          title: 'Columns (empty = Categories + Quick Links + Contact)',
          type: 'array',
          validation: (r) => r.max(4),
          of: [
            defineArrayMember({
              type: 'object',
              name: 'footerCategoriesColumn',
              title: 'Categories (automatic)',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Column title', initialValue: 'Categories' }),
                defineField({ name: 'limit', type: 'number', title: 'How many categories', initialValue: 8, validation: (r) => r.min(2).max(12).integer() }),
                defineField({ name: 'showIcons', type: 'boolean', title: 'Show each category’s emoji icon', initialValue: true }),
              ],
              preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || 'Categories', subtitle: 'Automatic list of categories' }) },
            }),
            defineArrayMember({
              type: 'object',
              name: 'footerLinksColumn',
              title: 'Links column',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Column title', validation: (r) => r.required() }),
                defineField({
                  name: 'links',
                  type: 'array',
                  title: 'Links (drag to reorder)',
                  of: [defineArrayMember({ type: 'pageLink' }), defineArrayMember({ type: 'categoryLink' }), defineArrayMember({ type: 'navLink' })],
                }),
              ],
              preview: {
                select: { title: 'title', links: 'links' },
                prepare: ({ title, links }) => ({ title: title || 'Links', subtitle: `${(links ?? []).length} links` }),
              },
            }),
          ],
        }),
        defineField({
          name: 'copyright',
          title: 'Copyright line',
          type: 'string',
          description: 'Leave empty for "© {year} {site name}. All rights reserved."',
        }),
        defineField({
          name: 'disclosure',
          title: 'Disclosure text (bottom right)',
          type: 'text',
          rows: 2,
          description: 'Leave empty for the standard affiliate disclosure (shown only when the Affiliate or Offers module is on).',
        }),
      ],
    }),
    defineField({
      name: 'social',
      title: 'Social profiles',
      type: 'object',
      group: 'navigation',
      options: { collapsible: true, collapsed: true },
      fields: ['x', 'facebook', 'instagram', 'youtube', 'pinterest', 'tiktok', 'linkedin'].map((name) =>
        defineField({ name, title: name === 'x' ? 'X / Twitter URL' : `${name[0].toUpperCase()}${name.slice(1)} URL`, type: 'url' }),
      ),
    }),

    // ── 5. Home page ────────────────────────────────────────────────────────
    defineField({
      name: 'homeSections',
      title: 'Home page sections',
      type: 'array',
      group: 'home',
      description:
        'The home page is built from these blocks, top to bottom. A new site starts with Hero, Trending, Recently published and Featured (hidden until you switch it on). Edit them, drag to reorder, hide with "Hide this section", or add more from the library.',
      initialValue: DEFAULT_HOME_SECTIONS,
      of: [
        defineArrayMember({ type: 'heroSection' }),
        defineArrayMember({ type: 'trendingPostsSection' }),
        defineArrayMember({ type: 'latestPostsSection' }),
        defineArrayMember({ type: 'featuredPostsSection' }),
        defineArrayMember({ type: 'categoryShelvesSection' }),
        defineArrayMember({ type: 'categoryGridSection' }),
        defineArrayMember({ type: 'topPicksSection' }),
        defineArrayMember({ type: 'topOffersSection' }),
        defineArrayMember({ type: 'trustSection' }),
        defineArrayMember({ type: 'richTextSection' }),
        defineArrayMember({ type: 'faqSection' }),
        defineArrayMember({ type: 'ctaSection' }),
      ],
    }),

    // ── 6. Ads & affiliate ──────────────────────────────────────────────────
    defineField({
      name: 'ads',
      title: 'Google AdSense',
      type: 'object',
      group: 'money',
      options: collapsible,
      fields: [
        defineField({
          name: 'adsenseClientId',
          title: 'AdSense publisher ID',
          type: 'string',
          description: 'Looks like ca-pub-1234567890123456. Leave empty to run the site without ads.',
          validation: (r) => r.custom((v) => (!v || /^ca-pub-\d{10,}$/.test(String(v)) ? true : 'Format: ca-pub- followed by digits')),
        }),
        defineField({
          name: 'autoAds',
          title: 'Use Auto ads',
          type: 'boolean',
          description: 'Let Google place ads automatically. Turn off if you only want the manual slots below.',
          initialValue: false,
        }),
        defineField({ name: 'topSlot', title: 'Top-of-article ad slot ID', type: 'string', description: 'Numeric slot ID from AdSense → Ads → By ad unit.' }),
        defineField({ name: 'inArticleSlot', title: 'In-article ad slot ID', type: 'string', description: 'Shown inside long articles (after the 3rd paragraph, then spaced out).' }),
        defineField({ name: 'sidebarSlot', title: 'Sidebar ad slot ID', type: 'string' }),
        defineField({
          name: 'consentMode',
          title: 'Cookie consent (UK / EEA visitors)',
          type: 'string',
          description:
            'Google’s free "Privacy & messaging" consent tool is configured inside your AdSense account (Privacy & messaging → create a GDPR message). "Google CMP" here makes analytics wait for the visitor’s choice in the UK/EEA — visitors elsewhere are unaffected.',
          options: {
            list: [
              { title: 'Google CMP (recommended)', value: 'google-cmp' },
              { title: 'Off', value: 'off' },
            ],
            layout: 'radio',
          },
          initialValue: 'google-cmp',
        }),
        defineField({
          name: 'extraAdsTxt',
          title: 'Extra ads.txt lines',
          type: 'text',
          rows: 3,
          description: 'Optional extra partner lines. The AdSense line is added automatically at /ads.txt.',
        }),
      ],
    }),
    defineField({
      name: 'affiliate',
      title: 'Affiliate',
      type: 'object',
      group: 'money',
      options: collapsible,
      fields: [
        defineField({
          name: 'amazonTag',
          title: 'Amazon Associates tracking ID',
          type: 'string',
          description: 'For the country you picked, e.g. mysite-20 (US), mysite-21 (UK). Added to every Amazon ASIN link.',
        }),
        defineField({
          name: 'autoDisclosure',
          title: 'Show an affiliate disclosure on review / comparison articles',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'disclosureText',
          title: 'Disclosure wording (optional)',
          type: 'text',
          rows: 3,
          description: 'Leave empty for a default notice that matches your country’s advertising rules.',
        }),
      ],
    }),

    // ── 7. Analytics ────────────────────────────────────────────────────────
    defineField({
      name: 'analytics',
      title: 'Analytics & verification',
      type: 'object',
      group: 'analytics',
      options: collapsible,
      fields: [
        defineField({
          name: 'ga4Id',
          title: 'Google Analytics 4 ID',
          type: 'string',
          description: 'G-XXXXXXXXXX',
          validation: (r) => r.custom((v) => (!v || /^G-[A-Z0-9]{6,}$/.test(String(v)) ? true : 'Format: G-XXXXXXXXXX')),
        }),
        defineField({ name: 'clarityId', title: 'Microsoft Clarity project ID', type: 'string' }),
        defineField({
          name: 'googleVerification',
          title: 'Google Search Console verification code',
          type: 'string',
          description: 'Only the content="…" value of the HTML-tag method.',
        }),
        defineField({ name: 'bingVerification', title: 'Bing Webmaster verification code', type: 'string' }),
      ],
    }),

    // ── 8. SEO ──────────────────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO defaults',
      type: 'object',
      group: 'seo',
      options: collapsible,
      fields: [
        defineField({
          name: 'titleTemplate',
          title: 'Page title template',
          type: 'string',
          description: 'Use %s for the page title. Default: "%s | Site name".',
          validation: (r) => r.custom((v) => (!v || String(v).includes('%s') ? true : 'Must contain %s')),
        }),
        defineField({ name: 'defaultDescription', title: 'Default meta description', type: 'text', rows: 2, validation: (r) => r.max(160) }),
        defineField({
          name: 'defaultOgImage',
          title: 'Default social share image',
          type: 'image',
          description: '1200×630 px. Used when a page has no image of its own.',
        }),
        defineField({ name: 'twitterHandle', title: 'X / Twitter handle', type: 'string', description: 'Without the @.' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName', subtitle: 'country' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Site Settings', subtitle: subtitle }),
  },
})
