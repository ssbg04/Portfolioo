import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { vercelDeployTool } from 'sanity-plugin-vercel-deploy'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Developer Portfolio Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'rk63yuwi',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool(), visionTool(), vercelDeployTool()],

  schema: {
    types: schemaTypes,
  },
})
