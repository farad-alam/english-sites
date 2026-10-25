import { defineField, defineType } from 'sanity'

export const categorySchema = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Appears in the URL: /category/your-slug',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, description: 'Shown on the category page and used as its meta description.' }),
    defineField({
      name: 'parent',
      title: 'Parent category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Leave empty for a top-level category.',
      options: {
        filter: ({ document }) => ({ filter: '_id != $id', params: { id: (document as { _id: string })._id } }),
      },
    }),
    defineField({ name: 'icon', title: 'Icon (one emoji)', type: 'string', description: 'e.g. 🏠 💻 🍳' }),
    defineField({ name: 'order', title: 'Display order', type: 'number', description: 'Lower numbers come first in menus and grids.' }),
  ],
  preview: {
    select: { title: 'title', icon: 'icon', parent: 'parent.title' },
    prepare: ({ title, icon, parent }) => ({
      title: `${icon ?? ''} ${title ?? ''}`.trim(),
      subtitle: parent ? `Sub-category of ${parent}` : 'Top-level',
    }),
  },
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
