import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './schemas'
import { apiVersion, dataset, projectId } from './client'

export const sanityConfig = defineConfig({
  projectId,
  dataset,
  apiVersion,
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemas },
})
