import { siteSettingsSchema } from './siteSettings'
import { postSchema } from './post'
import { categorySchema } from './category'
import { authorSchema } from './author'
import { offerSchema } from './offer'
import { affiliateLinkSchema } from './affiliateLink'
import { staticPageSchema } from './staticPage'
import { autoCategoriesSchema, categoryLinkSchema, navLinkSchema, pageLinkSchema } from './objects/navLink'
import { productCardSchema } from './blocks/productCard'
import { productComparisonTableSchema } from './blocks/productComparisonTable'
import { offerCardSchema } from './blocks/offerCard'
import { prosConsBlockSchema } from './blocks/prosConsBlock'
import { faqBlockSchema } from './blocks/faqBlock'
import { calloutBlockSchema } from './blocks/calloutBlock'
import { sectionSchemas } from './sections'

export const schemaTypes = [
  // Documents
  siteSettingsSchema,
  postSchema,
  categorySchema,
  authorSchema,
  offerSchema,
  affiliateLinkSchema,
  staticPageSchema,
  // Reusable objects
  navLinkSchema,
  pageLinkSchema,
  categoryLinkSchema,
  autoCategoriesSchema,
  // Article / review blocks
  productCardSchema,
  productComparisonTableSchema,
  offerCardSchema,
  prosConsBlockSchema,
  faqBlockSchema,
  calloutBlockSchema,
  // Home page sections
  ...sectionSchemas,
]
