import { createClient } from 'next-sanity'

export const projectId  = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset    = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-01-01'

// When credentials are not yet configured (local dev without a real Sanity project)
// return null from fetch() rather than throwing, so the app renders gracefully.
const isConfigured = Boolean(projectId && projectId !== 'your_project_id')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopClient = { fetch: (): Promise<any> => Promise.resolve(null), create: (): Promise<any> => Promise.resolve(null), patch: () => ({ set: () => ({ commit: (): Promise<any> => Promise.resolve(null) }) }) } as unknown as ReturnType<typeof createClient>

/**
 * Public read-only client — safe to use in Server Components and anywhere.
 * Uses CDN, no auth token.
 */
export const client = isConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : noopClient

/**
 * Authenticated write client — SERVER ONLY.
 *
 * NEVER import this in a 'use client' component or any file that could be
 * bundled into the browser. The SANITY_API_TOKEN env var (no NEXT_PUBLIC_ prefix)
 * is stripped from client bundles by Next.js, but the import guard below
 * provides an explicit runtime safety net during development.
 */
export const serverClient = (() => {
  // Runtime guard: this module must only execute on the server.
  // In the browser `window` exists; on the server it does not.
  if (typeof window !== 'undefined') {
    throw new Error(
      '[sanity/client] serverClient was imported in a browser context. ' +
      'Only import it in Server Components, API Route Handlers, or server actions.'
    )
  }

  if (!isConfigured) return noopClient

  const token = process.env.SANITY_API_TOKEN
  if (!token || token === 'your_sanity_token') {
    // In production, a missing token is a hard error.
    // In development, log a warning and return the noop client.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[sanity/client] SANITY_API_TOKEN is not configured in production')
    }
    console.warn('[sanity/client] SANITY_API_TOKEN not set — write operations will be no-ops')
    return noopClient
  }

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
})()
