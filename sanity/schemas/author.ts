import { defineField, defineType } from 'sanity'
import { bodyField } from './shared'

export const authorSchema = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'firstName', title: 'First name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lastName', title: 'Last name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: (doc) => `${(doc as { firstName?: string }).firstName ?? ''} ${(doc as { lastName?: string }).lastName ?? ''}`.trim(),
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Square headshot, at least 400×400 px.',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'jobTitle', title: 'Job title', type: 'string', description: 'e.g. Senior Tech Writer' }),
    defineField({
      name: 'shortBio',
      title: 'Short bio',
      type: 'text',
      rows: 3,
      description: 'Shown under articles. Max 220 characters.',
      validation: (r) => r.max(220),
    }),
    bodyField({ name: 'fullBio', title: 'Full bio (author page)', withImages: false }),
    defineField({
      name: 'expertiseAreas',
      title: 'Topics they know well',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Helps search engines understand the author’s expertise (E-E-A-T).',
    }),
    defineField({ name: 'yearsExperience', title: 'Years of experience', type: 'number' }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'x', title: 'X / Twitter URL', type: 'url' }),
    defineField({ name: 'website', title: 'Website URL', type: 'url' }),
  ],
  preview: {
    select: { first: 'firstName', last: 'lastName', media: 'avatar', subtitle: 'jobTitle' },
    prepare: ({ first, last, media, subtitle }) => ({ title: `${first ?? ''} ${last ?? ''}`.trim(), subtitle, media }),
  },
})
