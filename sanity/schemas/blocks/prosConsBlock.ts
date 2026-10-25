import { defineField, defineType } from 'sanity'

export const prosConsBlockSchema = defineType({
  name: 'prosConsBlock',
  title: 'Pros & cons',
  type: 'object',
  fields: [
    defineField({ name: 'pros', title: 'Pros', type: 'array', of: [{ type: 'string' }], validation: (r) => r.min(1) }),
    defineField({ name: 'cons', title: 'Cons', type: 'array', of: [{ type: 'string' }], validation: (r) => r.min(1) }),
  ],
  preview: {
    select: { pros: 'pros', cons: 'cons' },
    prepare: ({ pros, cons }) => ({ title: 'Pros & cons', subtitle: `${pros?.length ?? 0} pros · ${cons?.length ?? 0} cons` }),
  },
})
