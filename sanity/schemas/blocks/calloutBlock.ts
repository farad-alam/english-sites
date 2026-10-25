import { defineField, defineType } from 'sanity'

export const calloutBlockSchema = defineType({
  name: 'calloutBlock',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Tip', value: 'tip' },
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Important', value: 'important' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'info',
    }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() }),
  ],
  preview: {
    select: { type: 'type', text: 'text' },
    prepare: ({ type, text }) => ({ title: `Callout · ${type ?? 'info'}`, subtitle: String(text ?? '').slice(0, 70) }),
  },
})
