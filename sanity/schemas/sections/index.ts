import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * HOME PAGE SECTION LIBRARY
 * Each type here has a matching React component in components/sections/.
 * Adding a section = one schema here + one component + one line in the registry.
 */

const disabledField = defineField({
  name: 'disabled',
  title: 'Hide this section',
  type: 'boolean',
  description: 'Keeps the section saved but removes it from the live page.',
  initialValue: false,
})

const ctaFields = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: { columns: 2 },
    fields: [
      { name: 'label', type: 'string', title: 'Button text' },
      { name: 'href', type: 'string', title: 'Link (e.g. /blog or https://…)' },
    ],
  })

export const heroSectionSchema = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Small label above the heading', type: 'string' }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'Empty = the site name.' }),
    defineField({ name: 'subheading', title: 'Sub-heading', type: 'text', rows: 2, description: 'Empty = the site tagline.' }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: { list: [{ title: 'Centered text', value: 'centered' }, { title: 'Text + image side by side', value: 'split' }], layout: 'radio' },
      initialValue: 'centered',
    }),
    defineField({ name: 'showSearch', title: 'Show a search box', type: 'boolean', initialValue: true }),
    ctaFields('primaryCta', 'Main button'),
    ctaFields('secondaryCta', 'Second button'),
    defineField({ name: 'image', title: 'Image (split layout)', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] }),
    disabledField,
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: 'Hero', subtitle: title }) },
})

export const latestPostsSectionSchema = defineType({
  name: 'latestPostsSection',
  title: 'Latest articles',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Latest articles' }),
    defineField({ name: 'count', title: 'How many', type: 'number', initialValue: 6, validation: (r) => r.min(3).max(24) }),
    defineField({ name: 'category', title: 'Only from this category (optional)', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'showViewAll', title: 'Show "View all" link', type: 'boolean', initialValue: true }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Latest articles', subtitle: title }) },
})

export const featuredPostsSectionSchema = defineType({
  name: 'featuredPostsSection',
  title: 'Featured articles (hand-picked)',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Editor’s picks' }),
    defineField({
      name: 'posts',
      title: 'Articles (first one is shown large)',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })],
      validation: (r) => r.min(1).max(7),
    }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Featured articles', subtitle: title }) },
})

export const categoryShelvesSectionSchema = defineType({
  name: 'categoryShelvesSection',
  title: 'Category shelves (latest per category)',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Browse by topic' }),
    defineField({
      name: 'categories',
      title: 'Categories (empty = the first 3 top-level categories)',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })],
      validation: (r) => r.max(6),
    }),
    defineField({ name: 'postsPerShelf', title: 'Articles per shelf', type: 'number', initialValue: 3, validation: (r) => r.min(2).max(6) }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Category shelves', subtitle: title }) },
})

export const categoryGridSectionSchema = defineType({
  name: 'categoryGridSection',
  title: 'Category grid',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Explore topics' }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Category grid', subtitle: title }) },
})

export const topPicksSectionSchema = defineType({
  name: 'topPicksSection',
  title: 'Top picks (affiliate)',
  type: 'object',
  description: 'Needs the Affiliate module.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Our top picks' }),
    defineField({ name: 'subtitle', title: 'Sub-title', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Picks',
      type: 'array',
      validation: (r) => r.max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pick',
          fields: [
            defineField({ name: 'badge', title: 'Badge', type: 'string', description: 'e.g. "Best overall"' }),
            defineField({ name: 'title', title: 'Product name', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'summary', title: 'One-line verdict', type: 'text', rows: 2 }),
            defineField({ name: 'rating', title: 'Rating (0–5)', type: 'number', validation: (r) => r.min(0).max(5) }),
            defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] }),
            defineField({ name: 'post', title: 'Link to your review article', type: 'reference', to: [{ type: 'post' }] }),
            defineField({ name: 'offer', title: 'Or link to an offer page', type: 'reference', to: [{ type: 'offer' }] }),
            defineField({ name: 'link', title: 'Or a managed affiliate link', type: 'reference', to: [{ type: 'affiliateLink' }] }),
            defineField({ name: 'url', title: 'Or a plain URL', type: 'url' }),
            defineField({ name: 'ctaLabel', title: 'Button text', type: 'string', initialValue: 'Read review' }),
          ],
          preview: { select: { title: 'title', subtitle: 'badge', media: 'image' } },
        }),
      ],
    }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Top picks', subtitle: title }) },
})

export const topOffersSectionSchema = defineType({
  name: 'topOffersSection',
  title: 'Top offers (digital products)',
  type: 'object',
  description: 'Needs the Offers module.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Top deals' }),
    defineField({ name: 'subtitle', title: 'Sub-title', type: 'string' }),
    defineField({
      name: 'offers',
      title: 'Offers (empty = your featured offers)',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'offer' }] })],
      validation: (r) => r.max(8),
    }),
    defineField({ name: 'count', title: 'How many (when empty above)', type: 'number', initialValue: 4, validation: (r) => r.min(2).max(8) }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Top offers', subtitle: title }) },
})

export const faqSectionSchema = defineType({
  name: 'faqSection',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', initialValue: 'Frequently asked questions' }),
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqEntry',
          fields: [
            defineField({ name: 'question', type: 'string', title: 'Question', validation: (r) => r.required() }),
            defineField({ name: 'answer', type: 'text', title: 'Answer', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'FAQ', subtitle: title }) },
})

export const trustSectionSchema = defineType({
  name: 'trustSection',
  title: 'Trust strip (3–4 reasons to trust you)',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Items (empty = sensible defaults)',
      type: 'array',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'trustItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Shield', value: 'shield' },
                  { title: 'Check', value: 'check' },
                  { title: 'Refresh', value: 'refresh' },
                  { title: 'Star', value: 'star' },
                  { title: 'Book', value: 'book' },
                  { title: 'Users', value: 'users' },
                ],
              },
              initialValue: 'check',
            }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: 'Text', type: 'string' }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),
    disabledField,
  ],
  preview: { prepare: () => ({ title: 'Trust strip' }) },
})

export const richTextSectionSchema = defineType({
  name: 'richTextSection',
  title: 'Text block',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }, { title: 'H3', value: 'h3' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
            annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'string', title: 'URL' }] }],
          },
        }),
      ],
    }),
    disabledField,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: 'Text block', subtitle: title }) },
})

export const ctaSectionSchema = defineType({
  name: 'ctaSection',
  title: 'Call-to-action banner',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
    defineField({ name: 'buttonLabel', title: 'Button text', type: 'string' }),
    defineField({ name: 'buttonHref', title: 'Button link', type: 'string' }),
    disabledField,
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: 'CTA banner', subtitle: title }) },
})

export const sectionSchemas = [
  heroSectionSchema,
  latestPostsSectionSchema,
  featuredPostsSectionSchema,
  categoryShelvesSectionSchema,
  categoryGridSectionSchema,
  topPicksSectionSchema,
  topOffersSectionSchema,
  faqSectionSchema,
  trustSectionSchema,
  richTextSectionSchema,
  ctaSectionSchema,
]
