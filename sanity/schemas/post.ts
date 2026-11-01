import { defineField, defineType } from 'sanity'
import { RESERVED_SLUGS } from '../../lib/reserved'
import { bodyField } from './shared'

export const postSchema = defineType({
  name: 'post',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'affiliate', title: 'Affiliate' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (r) => r.required().max(110),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      description: 'The article lives at /your-slug — click Generate.',
      validation: (r) =>
        r.required().custom((v) =>
          v?.current && (RESERVED_SLUGS as readonly string[]).includes(v.current)
            ? `"${v.current}" is used by the site itself — choose another slug.`
            : true,
        ),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / meta description',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown in listings and used as the meta description. Aim for 140–160 characters.',
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Cover photo (1536 x 864)',
      type: 'image',
      group: 'content',
      options: { hotspot: true, accept: 'image/jpeg,image/webp,image/png' },
      description:
        'Recommended size: 1536 x 864 px (16:9). The article column is 768 px wide, so this is crisp on high-density screens, and the same 16:9 shape shows fully on the home page and article cards without cropping. JPG, WebP or PNG. Or paste an image URL below (handy for bulk imports).',
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required().error('Describe the cover image (alt text).') },
        { name: 'externalUrl', type: 'url', title: 'Image URL (instead of uploading)' },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }], group: 'content' }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'content',
      initialValue: () => new Date().toISOString(),
      description: 'Leave as now and publish when the article is ready. A future date hides the article, but nothing re-checks the date automatically, so it only appears the next time any content is published or edited. For exact timing use Sanity scheduled publishing (paid plans).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last updated',
      type: 'datetime',
      group: 'content',
      description: 'Set when you make a meaningful update — shown to readers and sent to search engines as the modified date.',
    }),
    defineField({
      name: 'articleType',
      title: 'Article type',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Review', value: 'review' },
          { title: 'Comparison / best-of', value: 'comparison' },
          { title: 'How-to / guide', value: 'howto' },
          { title: 'Informational', value: 'informational' },
          { title: 'News', value: 'news' },
        ],
      },
      initialValue: 'informational',
      description: 'Review and comparison articles get the affiliate disclosure (when the Affiliate module is on).',
    }),
    bodyField({
      group: 'content',
      title: 'Article body',
      blocks: ['productCard', 'productComparisonTable', 'offerCard', 'prosConsBlock', 'faqBlock', 'calloutBlock', 'tableBlock', 'youtubeEmbed', 'checklistBlock', 'chartBlock'],
    }),

    // SEO
    defineField({ name: 'seoTitle', title: 'SEO title (optional)', type: 'string', group: 'seo', validation: (r) => r.max(70).warning('Titles over ~60 characters may be cut off in Google.') }),
    defineField({ name: 'seoDescription', title: 'SEO description (optional)', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(170).warning('Over ~160 characters may be cut off.') }),
    defineField({ name: 'keywords', title: 'Target keywords', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, group: 'seo' }),
    defineField({ name: 'canonicalUrl', title: 'Canonical URL', type: 'url', group: 'seo', description: 'Only if this article was first published elsewhere.' }),
    defineField({ name: 'noIndex', title: 'Unlisted (hide from search engines and article lists)', type: 'boolean', group: 'seo', initialValue: false, description: 'The article stays reachable by its link, but is marked noindex and left out of the sitemap, search, related articles and lists.' }),
    defineField({ name: 'noAds', title: 'Do not show ads on this article', type: 'boolean', group: 'seo', initialValue: false, description: 'Use for thin or sensitive pages.' }),

    // Affiliate
    defineField({
      name: 'affiliateDisclosure',
      title: 'Always show the affiliate disclosure',
      type: 'boolean',
      group: 'affiliate',
      initialValue: false,
      description: 'It already shows automatically on Review and Comparison articles. Tick this to force it on other types.',
    }),
    defineField({
      name: 'overallRating',
      title: 'Overall rating (1–5)',
      type: 'number',
      group: 'affiliate',
      validation: (r) => r.min(1).max(5),
      description: 'Review articles only. Shown as a score and sent to Google as review markup.',
    }),
    defineField({
      name: 'reviewedItem',
      title: 'Product being reviewed',
      type: 'object',
      group: 'affiliate',
      description: 'Needed for review rich results. Fill in for single-product reviews only.',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'name', type: 'string', title: 'Product name' },
        { name: 'brand', type: 'string', title: 'Brand' },
      ],
    }),
  ],
  // The slug is the preview "subtitle" on purpose: Studio search gives title (weight 10) and
  // subtitle (weight 5) priority, so typing part of the URL finds an article, and the picker
  // shows the slug next to every result. This is what makes the Trending / Featured pickers usable with 500+ articles.
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'mainImage', date: 'publishedAt', category: 'category.title' },
    prepare: ({ title, subtitle, media, date, category }) => ({
      title: title ?? 'Untitled',
      subtitle: [subtitle ? `/${subtitle}` : '', category, date ? new Date(date).toLocaleDateString('en-GB') : 'Draft'].filter(Boolean).join(' · '),
      media,
    }),
  },
  orderings: [{ title: 'Newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})
