import { defineField, defineType } from 'sanity'
import { bodyField } from './shared'

/**
 * An "offer" is a digital product you promote: SaaS, hosting, a course, a plugin…
 * Each one gets its own review page at /offers/<slug>, and can be featured on the
 * home page or dropped into any article with the "Offer card" block.
 */
export const offerSchema = defineType({
  name: 'offer',
  title: 'Offer (software / hosting / course)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'review', title: 'Review page' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Product name', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'main',
      options: { source: 'name', maxLength: 80 },
      description: 'The page lives at /offers/your-slug',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'main', description: 'One line: what it is and who it’s for.', validation: (r) => r.max(140) }),
    defineField({ name: 'logo', title: 'Logo', type: 'image', group: 'main', fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] }),
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }], group: 'main' }),
    defineField({ name: 'rating', title: 'Your rating (1–5)', type: 'number', group: 'main', validation: (r) => r.min(1).max(5) }),
    defineField({ name: 'startingPrice', title: 'Starting price', type: 'string', group: 'main', description: 'Free text, e.g. "$2.95/mo" or "Free plan available".' }),
    defineField({
      name: 'pricingModel',
      title: 'Pricing model',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Free', value: 'free' },
          { title: 'Freemium', value: 'freemium' },
          { title: 'Paid', value: 'paid' },
          { title: 'One-time payment', value: 'one-time' },
        ],
      },
    }),
    defineField({ name: 'freeTrial', title: 'Free trial / guarantee', type: 'string', group: 'main', description: 'e.g. "30-day money-back guarantee"' }),
    defineField({ name: 'bestFor', title: 'Best for', type: 'string', group: 'main', description: 'e.g. "Beginners and small blogs"' }),
    defineField({ name: 'promoCode', title: 'Promo code', type: 'string', group: 'main' }),
    defineField({ name: 'promoNote', title: 'Deal note', type: 'string', group: 'main', description: 'e.g. "Save 40% on the first year"' }),
    defineField({
      name: 'link',
      title: 'Affiliate link',
      type: 'reference',
      to: [{ type: 'affiliateLink' }],
      group: 'main',
      description: 'Preferred. Create it under Affiliate links, then pick it here.',
    }),
    defineField({ name: 'url', title: 'Or a plain URL', type: 'url', group: 'main', description: 'Used only when no affiliate link is selected.' }),
    defineField({ name: 'featured', title: 'Feature this offer', type: 'boolean', group: 'main', initialValue: false, description: 'Featured offers are listed first.' }),
    defineField({ name: 'order', title: 'Display order', type: 'number', group: 'main' }),

    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 4, group: 'review', description: 'A short verdict (2–3 sentences) shown at the top of the page.' }),
    defineField({ name: 'features', title: 'Key features', type: 'array', of: [{ type: 'string' }], group: 'review' }),
    defineField({ name: 'pros', title: 'Pros', type: 'array', of: [{ type: 'string' }], group: 'review' }),
    defineField({ name: 'cons', title: 'Cons', type: 'array', of: [{ type: 'string' }], group: 'review' }),
    defineField({ name: 'author', title: 'Reviewed by', type: 'reference', to: [{ type: 'author' }], group: 'review' }),
    bodyField({ group: 'review', title: 'Full review', blocks: ['productComparisonTable', 'prosConsBlock', 'faqBlock', 'calloutBlock'] }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', group: 'review', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'datetime', group: 'review' }),

    defineField({ name: 'seoTitle', title: 'SEO title (optional)', type: 'string', group: 'seo', validation: (r) => r.max(70) }),
    defineField({ name: 'seoDescription', title: 'SEO description (optional)', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(170) }),
    defineField({ name: 'noIndex', title: 'Hide from search engines (noindex)', type: 'boolean', group: 'seo', initialValue: false }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'logo' },
  },
  orderings: [
    { title: 'Featured first', name: 'featured', by: [{ field: 'featured', direction: 'desc' }, { field: 'order', direction: 'asc' }] },
  ],
})
