import { defineField, defineType } from 'sanity'

/**
 * A managed affiliate link. Articles and offers point at this document, and
 * visitors go through /go/<slug>. Change the destination here once and every
 * article updates; the /go/ URL is also ignored by crawlers.
 */
export const affiliateLinkSchema = defineType({
  name: 'affiliateLink',
  title: 'Affiliate link',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', description: 'For you only — e.g. "Bluehost – WordPress plan".', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Short URL',
      type: 'slug',
      options: { source: 'name', maxLength: 60 },
      description: 'Visitors see /go/this-slug',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Destination type',
      type: 'string',
      options: {
        list: [
          { title: 'Amazon product (ASIN)', value: 'amazon' },
          { title: 'Any other URL (Impact, ShareASale, CJ, direct…)', value: 'url' },
        ],
        layout: 'radio',
      },
      initialValue: 'url',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'asin',
      title: 'Amazon ASIN',
      type: 'string',
      description: '10 characters, found in the product URL after /dp/. The store and your tracking ID come from Site Settings.',
      hidden: ({ parent }) => parent?.kind !== 'amazon',
      validation: (r) =>
        r.custom((v, ctx) => {
          if ((ctx.parent as { kind?: string })?.kind !== 'amazon') return true
          return v && /^[A-Z0-9]{10}$/i.test(String(v)) ? true : 'An ASIN is 10 letters/numbers'
        }),
    }),
    defineField({
      name: 'url',
      title: 'Affiliate URL',
      type: 'url',
      description: 'The full tracking link from the affiliate network.',
      hidden: ({ parent }) => parent?.kind !== 'url',
      validation: (r) =>
        r
          .uri({ scheme: ['http', 'https'] })
          .custom((v, ctx) => ((ctx.parent as { kind?: string })?.kind === 'url' && !v ? 'Required' : true)),
    }),
  ],
  preview: {
    select: { title: 'name', slug: 'slug.current', kind: 'kind' },
    prepare: ({ title, slug, kind }) => ({ title, subtitle: `/go/${slug ?? ''} · ${kind === 'amazon' ? 'Amazon' : 'URL'}` }),
  },
})
