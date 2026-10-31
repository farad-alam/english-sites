import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Extra article blocks: table, YouTube embed, checklist.
 * Plain data shapes (strings and arrays) so they can also be written through
 * the Sanity API, not only typed into the Studio.
 */

export const tableBlockSchema = defineType({
  name: 'tableBlock',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
    defineField({
      name: 'firstRowHeader',
      title: 'First row is a header',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description: 'Each row holds one text cell per column. Keep every row the same number of cells.',
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: 'tableRow',
          title: 'Row',
          type: 'object',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{ type: 'string' }],
              validation: (r) => r.required().min(1),
            }),
          ],
          preview: {
            select: { cells: 'cells' },
            prepare: ({ cells }) => ({ title: (cells || []).join('  |  ') || 'Empty row' }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { caption: 'caption', rows: 'rows' },
    prepare: ({ caption, rows }) => ({
      title: `Table · ${caption || 'untitled'}`,
      subtitle: `${(rows || []).length} rows`,
    }),
  },
})

export const youtubeEmbedSchema = defineType({
  name: 'youtubeEmbed',
  title: 'YouTube video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube link',
      type: 'url',
      description: 'Paste the video link. Only a thumbnail loads until the reader clicks play.',
      validation: (r) =>
        r
          .required()
          .uri({ scheme: ['https'] })
          .custom((value) =>
            !value || /^https:\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(value)
              ? true
              : 'Use a youtube.com or youtu.be link',
          ),
    }),
    defineField({ name: 'title', title: 'Title / caption (optional)', type: 'string' }),
  ],
  preview: {
    select: { title: 'title', url: 'url' },
    prepare: ({ title, url }) => ({ title: `Video · ${title || 'untitled'}`, subtitle: url }),
  },
})

export const checklistBlockSchema = defineType({
  name: 'checklistBlock',
  title: 'Checklist',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({
      title: `Checklist · ${title || 'untitled'}`,
      subtitle: `${(items || []).length} items`,
    }),
  },
})


export const chartBlockSchema = defineType({
  name: 'chartBlock',
  title: 'Chart',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Chart title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'chartType',
      title: 'Chart type',
      type: 'string',
      initialValue: 'bar',
      options: {
        layout: 'radio',
        list: [
          { title: 'Bars (compare amounts)', value: 'bar' },
          { title: 'Line (change over time)', value: 'line' },
          { title: 'Donut (share of a whole)', value: 'donut' },
        ],
      },
    }),
    defineField({
      name: 'unit',
      title: 'Unit (optional)',
      type: 'string',
      description: 'Shown after each number, for example %, gallons, USD or inches.',
    }),
    defineField({
      name: 'points',
      title: 'Data',
      type: 'array',
      description: 'One row per bar, point or slice. Keep it to 12 rows or fewer.',
      of: [
        {
          type: 'object',
          name: 'chartPoint',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'value', title: 'Value', type: 'number', validation: (r) => r.required().min(0) }),
          ],
          preview: {
            select: { title: 'label', value: 'value' },
            prepare: ({ title, value }) => ({ title: title || 'Untitled', subtitle: String(value ?? '') }),
          },
        },
      ],
      validation: (r) => r.required().min(2).max(12),
    }),
    defineField({
      name: 'caption',
      title: 'Caption or source (optional)',
      type: 'string',
      description: 'One sentence that says what the chart shows. Search engines read this text.',
    }),
  ],
  preview: {
    select: { title: 'title', type: 'chartType', points: 'points' },
    prepare: ({ title, type, points }) => ({
      title: `Chart · ${title || 'untitled'}`,
      subtitle: `${type || 'bar'} · ${(points || []).length} rows`,
    }),
  },
})
