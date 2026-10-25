import { defineField, defineType } from 'sanity'

export const navLinkSchema = defineType({
  name: 'navLink',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Use /blog, /offers, /about … for pages on this site, or a full https:// address.',
      validation: (r) =>
        r.required().custom((v) => (typeof v === 'string' && (v.startsWith('/') || /^https?:\/\//i.test(v)) ? true : 'Start with / or https://')),
    }),
    defineField({ name: 'newTab', title: 'Open in a new tab', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})
