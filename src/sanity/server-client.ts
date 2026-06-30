import { createClient } from 'next-sanity'
import { projectId, dataset, apiVersion, isConfigured, noopClient } from './client'

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
      '[sanity/server-client] serverClient was imported in a browser context. ' +
      'Only import it in Server Components, API Route Handlers, or server actions.'
    )
  }

  if (!isConfigured) return noopClient

  const token = process.env.SANITY_API_TOKEN
  if (!token || token === 'your_sanity_token') {
    // In production, a missing token is a hard error.
    // In development, log a warning and return the noop client.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[sanity/server-client] SANITY_API_TOKEN is not configured in production')
    }
    console.warn('[sanity/server-client] SANITY_API_TOKEN not set — write operations will be no-ops')
    return noopClient
  }

  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
})()
