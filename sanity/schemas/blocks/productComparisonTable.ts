import { defineArrayMember, defineField, defineType } from 'sanity'

/** A ranked "best X" table. Collapses to cards on phones. */
export const productComparisonTableSchema = defineType({
  name: 'productComparisonTable',
  title: 'Ranked comparison table',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', description: 'e.g. "Our top picks"' }),
    defineField({
      name: 'products',
      title: 'Products (in ranking order)',
      type: 'array',
      validation: (r) => r.min(1).max(12),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'comparisonProduct',
          fields: [
            defineField({ name: 'name', title: 'Product name', type: 'string', validation: (r) => r.required() }),
            defineField({
              name: 'verdict',
              title: 'Label',
              type: 'string',
              description: 'Pick one or type your own.',
              options: {
                list: [
                  { title: 'Best overall', value: 'best-overall' },
                  { title: 'Best budget', value: 'best-budget' },
                  { title: 'Best premium', value: 'best-premium' },
                  { title: 'Editor’s choice', value: 'editors-choice' },
                ],
              },
            }),
            defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] }),
            defineField({ name: 'imageUrl', title: 'Or an image URL', type: 'url' }),
            defineField({ name: 'rating', title: 'Score (0–5)', type: 'number', validation: (r) => r.min(0).max(5) }),
            defineField({ name: 'price', title: 'Price', type: 'string' }),
            defineField({ name: 'pros', title: 'Pros', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'cons', title: 'Cons', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'link', title: 'Affiliate link', type: 'reference', to: [{ type: 'affiliateLink' }] }),
            defineField({ name: 'asin', title: 'Or an Amazon ASIN', type: 'string' }),
            defineField({ name: 'url', title: 'Or a plain URL', type: 'url' }),
            defineField({ name: 'ctaLabel', title: 'Button text (optional)', type: 'string' }),
          ],
          preview: { select: { title: 'name', subtitle: 'price', media: 'image' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { heading: 'heading', products: 'products' },
    prepare: ({ heading, products }) => ({ title: heading ? `Table: ${heading}` : 'Ranked comparison table', subtitle: `${products?.length ?? 0} products` }),
  },
})
