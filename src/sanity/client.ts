import { createClient } from 'next-sanity'

export const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-01-01'

// When credentials are not yet configured (local dev without a real Sanity project)
// return null from fetch() rather than throwing, so the app renders gracefully.
export const isConfigured = Boolean(projectId && projectId !== 'your_project_id')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const noopClient = { fetch: (): Promise<any> => Promise.resolve(null), create: (): Promise<any> => Promise.resolve(null), patch: () => ({ set: () => ({ commit: (): Promise<any> => Promise.resolve(null) }) }) } as unknown as ReturnType<typeof createClient>

/**
 * Public read-only client — safe to use in Server Components and anywhere.
 * Uses CDN, no auth token.
 */
export const client = isConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : noopClient
