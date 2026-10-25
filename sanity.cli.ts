import { defineCliConfig } from 'sanity/cli'

// Used by `npm run studio:deploy` (hosted Studio on <name>.sanity.studio — free).
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: process.env.SANITY_STUDIO_HOST,
  deployment: { autoUpdates: true },
})
