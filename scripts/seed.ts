/**
 * Fills a Sanity dataset with demo content (articles, offers, affiliate links,
 * a configured home page) so you can see every feature working on a fresh site.
 *
 *   npm run seed              # refuses to touch a dataset that already has articles
 *   npm run seed -- --force   # overwrite documents with the same IDs
 *   npm run seed -- --dry-run # just say what would be written
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.local.
 * The demo settings carry no ad or analytics IDs, so demo content never earns from
 * fake IDs. Demo pages are public and indexable like any other content, so use this
 * on a scratch project (or delete the demo documents before launch).
 */
import { adminClient, fail, hasFlag } from './lib/admin'
import { buildDemoDataset } from './dev/demo-data'

const force = hasFlag('force')
const dryRun = hasFlag('dry-run')

// Demo images come from picsum.photos — fine for a demo, replace before launch.
type SeedDoc = { _id: string; _type: string; [key: string]: unknown }

const docs: SeedDoc[] = buildDemoDataset()
  .filter((d) => !d._id.startsWith('drafts.') && d._id !== 'post-future')
  .map((d): SeedDoc => {
    if (d._type !== 'siteSettings') return d
    return {
      ...d,
      ads: { autoAds: false, consentMode: 'google-cmp' },
      analytics: {},
      affiliate: { autoDisclosure: true },
    }
  })

console.log(`Demo dataset: ${docs.length} documents`)
if (dryRun) {
  for (const d of docs) console.log(`  ${d._type.padEnd(14)} ${d._id}`)
  process.exit(0)
}

const client = adminClient()
const existing = await client.fetch<number>('count(*[_type == "post"])')
if (existing > 0 && !force) {
  fail(`This dataset already has ${existing} article(s). Re-run with --force to overwrite the demo documents (your other content is left alone).`)
}

let tx = client.transaction()
for (const d of docs) tx = tx.createOrReplace(d)
await tx.commit()
console.log('✔ Demo content written. Open /studio to see it. Delete the demo documents when you start adding your own content.')
