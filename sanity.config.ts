import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

// Works both embedded in Next.js (NEXT_PUBLIC_*) and when deployed as a hosted
// Studio with `npm run studio:deploy` (SANITY_STUDIO_*).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'unconfigured'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'

const SINGLETONS = ['siteSettings']

export default defineConfig({
  basePath: process.env.SANITY_STUDIO_PROJECT_ID ? undefined : '/studio',
  name: 'site-studio',
  title: 'Site Studio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings')),
            S.divider(),
            S.documentTypeListItem('post').title('Articles'),
            S.documentTypeListItem('category').title('Categories'),
            S.documentTypeListItem('author').title('Authors'),
            S.divider(),
            S.documentTypeListItem('offer').title('Offers (software / hosting)'),
            S.documentTypeListItem('affiliateLink').title('Affiliate links'),
            S.divider(),
            S.documentTypeListItem('staticPage').title('Pages (About, Privacy…)'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Site Settings is a singleton: hide it from "New document".
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    // …and don't allow duplicate / delete / unpublish on it.
    actions: (input, { schemaType }) =>
      SINGLETONS.includes(schemaType) ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action)) : input,
  },
})
