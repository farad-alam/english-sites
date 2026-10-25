import { defineField, defineType } from 'sanity'
import { bodyField } from './shared'

/**
 * About / Privacy / Terms / Disclosure / Contact.
 * If a page has no document yet, the site shows a ready-made default for the
 * site’s country (see lib/legal-defaults.ts) — good enough to apply for AdSense
 * on day one, but have a lawyer review the legal text.
 */
export const staticPageSchema = defineType({
  name: 'staticPage',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Page',
      type: 'string',
      options: {
        list: [
          { title: 'About (/about)', value: 'about' },
          { title: 'Contact (/contact)', value: 'contact' },
          { title: 'Privacy Policy (/privacy)', value: 'privacy' },
          { title: 'Terms of Use (/terms)', value: 'terms' },
          { title: 'Affiliate Disclosure (/disclosure)', value: 'disclosure' },
        ],
        layout: 'radio',
      },
      description: 'Use each page only once.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 2, validation: (r) => r.max(160) }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, description: 'Shown under the title.' }),
    bodyField({ withImages: true }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'key' },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? `/${subtitle}` : undefined }),
  },
})
