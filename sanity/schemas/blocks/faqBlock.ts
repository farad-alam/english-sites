import { defineArrayMember, defineField, defineType } from 'sanity'

/** An accordion of questions. Also emits FAQPage structured data for the article. */
export const faqBlockSchema = defineType({
  name: 'faqBlock',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      validation: (r) => r.min(1),
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
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }) => ({ title: 'FAQ', subtitle: `${items?.length ?? 0} questions` }),
  },
})
