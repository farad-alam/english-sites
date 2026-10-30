import { defineArrayMember, defineField } from 'sanity'

/**
 * Rich-text body used by posts, offers, authors and static pages.
 * `blocks` lists the custom block types allowed in that field.
 */
export function bodyField(opts: { name?: string; title?: string; group?: string; blocks?: string[]; withImages?: boolean } = {}) {
  const { name = 'body', title = 'Body', group, blocks = [], withImages = true } = opts
  return defineField({
    name,
    title,
    type: 'array',
    group,
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'H4', value: 'h4' },
          { title: 'Quote', value: 'blockquote' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Bold', value: 'strong' },
            { title: 'Italic', value: 'em' },
            { title: 'Underline', value: 'underline' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                { name: 'href', type: 'string', title: 'URL', validation: (r) => r.required() },
                { name: 'blank', type: 'boolean', title: 'Open in new tab', initialValue: false },
                {
                  name: 'sponsored',
                  type: 'boolean',
                  title: 'Affiliate / sponsored link',
                  description: 'Adds rel="sponsored nofollow". Tick for any affiliate link.',
                  initialValue: false,
                },
                {
                  name: 'nofollow',
                  type: 'boolean',
                  title: 'Nofollow (do not pass link credit)',
                  description: 'Links pass credit by default, which is right for your own pages. Tick this for an outside link you do not want to vouch for. Not needed for sponsored links.',
                  initialValue: false,
                },
              ],
            },
          ],
        },
      }),
      ...(withImages
        ? [
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required().error('Describe the image for accessibility and image search.') },
                { name: 'caption', type: 'string', title: 'Caption (optional)' },
              ],
            }),
          ]
        : []),
      ...blocks.map((type) => defineArrayMember({ type })),
    ],
  })
}

export const imageWithAlt = (name: string, title: string, extra: Record<string, unknown> = {}) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      { name: 'alt', type: 'string', title: 'Alt text', description: 'Describe the image — used for accessibility and Google Images.' },
    ],
    ...extra,
  })
