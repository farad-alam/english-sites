import { defineField, defineType } from 'sanity'
import { PAGE_LINKS, pageLabel } from '../../../lib/pages'

/**
 * The link kinds an editor can put in the header menu and the footer.
 *   navLink          any address (a page of this site, or a full https:// URL)
 *   pageLink         a built-in page picked from a list (About, Contact, Privacy …)
 *   categoryLink     one of your categories
 *   autoCategories   (menu only) every category, kept up to date automatically
 */

export const navLinkSchema = defineType({
  name: 'navLink',
  title: 'Custom link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Use /blog, /my-article … for pages on this site, or a full https:// address.',
      validation: (r) =>
        r.required().custom((v) => (typeof v === 'string' && (v.startsWith('/') || /^https?:\/\//i.test(v)) ? true : 'Start with / or https://')),
    }),
    defineField({ name: 'newTab', title: 'Open in a new tab', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' }, prepare: ({ title, subtitle }) => ({ title, subtitle: `Link · ${subtitle ?? ''}` }) },
})

export const pageLinkSchema = defineType({
  name: 'pageLink',
  title: 'Page',
  type: 'object',
  fields: [
    defineField({
      name: 'page',
      title: 'Page',
      type: 'string',
      options: { list: PAGE_LINKS.map((p) => ({ title: p.label, value: p.value })) },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'label', title: 'Label (optional)', type: 'string', description: 'Leave empty to use the page name.' }),
  ],
  preview: {
    select: { page: 'page', label: 'label' },
    prepare: ({ page, label }) => ({ title: label || pageLabel(page) || 'Page', subtitle: 'Page' }),
  },
})

export const categoryLinkSchema = defineType({
  name: 'categoryLink',
  title: 'Category',
  type: 'object',
  fields: [
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }], options: { disableNew: true }, validation: (r) => r.required() }),
    defineField({ name: 'label', title: 'Label (optional)', type: 'string', description: 'Leave empty to use the category name.' }),
  ],
  preview: {
    select: { title: 'category.title', label: 'label' },
    prepare: ({ title, label }) => ({ title: label || title || 'Category', subtitle: 'Category' }),
  },
})

export const autoCategoriesSchema = defineType({
  name: 'autoCategories',
  title: 'All categories (automatic)',
  type: 'object',
  description: 'Every top-level category, in the order set on the categories. New categories appear by themselves.',
  fields: [
    defineField({
      name: 'showSubcategories',
      title: 'Show sub-categories in a drop-down',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: { prepare: () => ({ title: 'All categories (automatic)', subtitle: 'Drag this item to move the whole group' }) },
})
