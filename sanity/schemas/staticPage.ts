import { defineField, defineType } from 'sanity'
import { bodyField } from './shared'

/**
 * About / Privacy / Terms / Disclosure / Contact, plus any number of "Custom page"
 * documents (for example "How we review"). A custom page lives at /<slug>.
 * If a built-in page has no document yet, the site shows a ready-made default for the
 * site’s country (see lib/legal-defaults.ts) — good enough to apply for AdSense
 * on day one, but have a lawyer review the legal text.
 */

/** Addresses a custom page may not use: they already belong to the site itself. */
const RESERVED_SLUGS = [
  'about', 'contact', 'privacy', 'terms', 'disclosure', 'blog', 'category', 'authors', 'offers',
  'search', 'search-index', 'go', 'api', 'studio', 'sitemap', 'robots', 'ads', 'feed', 'rss',
  'admin', 'login', 'wp-admin', 'wp-login', 'favicon', 'manifest', '404', '500',
]

export const staticPageSchema = defineType({
  name: 'staticPage',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Page',
      type: 'string',
      options: {
        list: [
          { title: 'About (/about)', value: 'about' },
          { title: 'Contact (/contact)', value: 'contact' },
          { title: 'Privacy Policy (/privacy)', value: 'privacy' },
          { title: 'Terms of Use (/terms)', value: 'terms' },
          { title: 'Affiliate Disclosure (/disclosure)', value: 'disclosure' },
          { title: 'Custom page (you choose the address)', value: 'custom' },
        ],
        layout: 'radio',
      },
      description:
        'Use each built-in page only once. For any extra page (for example "How we review"), choose Custom page, then type its address below. Add it to the footer in Site Settings → Menu & footer → Footer (link type: custom address).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      description: 'Custom pages only. For "how-we-review" the page opens at /how-we-review. Use lowercase letters, numbers and hyphens.',
      hidden: ({ document }) => document?.key !== 'custom',
      validation: (r) =>
        r.custom(async (value, context) => {
          if (context.document?.key !== 'custom') return true
          const slug = (value as { current?: string } | undefined)?.current
          if (!slug) return 'Type the page address.'
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Use lowercase letters, numbers and single hyphens only.'
          if (RESERVED_SLUGS.includes(slug)) return '/' + slug + ' is already used by the site. Choose another address.'
          const id = String(context.document?._id ?? '').replace(/^drafts\./, '')
          const clash = await context
            .getClient({ apiVersion: '2024-01-01' })
            .fetch<number>(
              `count(*[((_type == "post") || (_type == "staticPage" && key == "custom")) && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
              { slug, id },
            )
          return clash > 0 ? 'Another article or custom page already uses /' + slug + '.' : true
        }),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 2, validation: (r) => r.max(160) }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, description: 'Shown under the title.' }),
    bodyField({ withImages: true }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', key: 'key', slug: 'slug.current' },
    prepare: ({ title, key, slug }) => ({
      title,
      subtitle: key === 'custom' ? (slug ? '/' + slug : '/ (set the page address)') : key ? '/' + key : undefined,
    }),
  },
})
