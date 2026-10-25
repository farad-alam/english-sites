import { defineField, defineType } from 'sanity'

/** Drops one of your Offers into an article as a compact deal box. */
export const offerCardSchema = defineType({
  name: 'offerCard',
  title: 'Offer card',
  type: 'object',
  fields: [
    defineField({ name: 'offer', title: 'Offer', type: 'reference', to: [{ type: 'offer' }], validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: 'offer.name', subtitle: 'offer.tagline' },
    prepare: ({ title, subtitle }) => ({ title: title ? `Offer: ${title}` : 'Offer card', subtitle }),
  },
})
