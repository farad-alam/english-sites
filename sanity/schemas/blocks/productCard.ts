import { defineField, defineType } from 'sanity'

/** A single product with image, rating, price and a buy button. */
export const productCardSchema = defineType({
  name: 'productCard',
  title: 'Product card',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Product name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'badge', title: 'Badge', type: 'string', description: 'e.g. "Best overall", "Editor’s choice"' }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'imageUrl', title: 'Or an image URL', type: 'url', description: 'Used only if no image is uploaded.' }),
    defineField({ name: 'rating', title: 'Rating (0–5)', type: 'number', validation: (r) => r.min(0).max(5) }),
    defineField({ name: 'price', title: 'Price', type: 'string', description: 'Free text, e.g. $29.99. Prices change — keep it up to date or leave it empty.' }),
    defineField({ name: 'description', title: 'Short description', type: 'text', rows: 2 }),
    defineField({
      name: 'link',
      title: 'Affiliate link',
      type: 'reference',
      to: [{ type: 'affiliateLink' }],
      description: 'Preferred: a managed link (/go/…).',
    }),
    defineField({ name: 'asin', title: 'Or an Amazon ASIN', type: 'string', description: 'The store and your tracking ID come from Site Settings.' }),
    defineField({ name: 'url', title: 'Or a plain URL', type: 'url' }),
    defineField({ name: 'ctaLabel', title: 'Button text (optional)', type: 'string', description: 'Default: "Check price on Amazon" for ASINs, "View deal" otherwise.' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'price', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title ? `Product: ${title}` : 'Product card', subtitle, media }),
  },
})
