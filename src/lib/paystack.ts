import crypto from 'crypto'
import { paystackReferenceSchema } from '@/lib/security'

/**
 * Verify a Paystack transaction reference server-side.
 * The secret key is only ever used here (server-only module).
 * Reference is validated against a safe regex before being interpolated
 * into the URL to prevent path-traversal attacks.
 */
export async function verifyPaystackTransaction(reference: string) {
  // Validate reference format before putting it in a URL
  const parsed = paystackReferenceSchema.safeParse(reference)
  if (!parsed.success) {
    throw new Error('Invalid payment reference format')
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) throw new Error('PAYSTACK_SECRET_KEY not configured')

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(parsed.data)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error(`Paystack verification failed: ${res.status}`)
  }

  const data = await res.json()
  return data.data as {
    status: string
    amount: number         // in smallest currency unit (pesewas)
    reference: string
    currency: string
    paid_at: string
  }
}

/**
 * Generate a cryptographically secure, unique order reference.
 * Format: SW-<base36-timestamp>-<8 random hex chars>
 *
 * Uses crypto.randomBytes — NOT Math.random — so it is unpredictable
 * and cannot be brute-forced or enumerated by a third party.
 */
export function generateOrderNumber(): string {
  const ts   = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `SW-${ts}-${rand}`
}
