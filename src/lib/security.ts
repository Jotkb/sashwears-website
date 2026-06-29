/**
 * Shared security utilities for all API routes.
 *
 * Responsibilities:
 *  - Input sanitisation (strip HTML/control characters → prevent XSS / stored injection)
 *  - Reusable Zod schemas for customer data, order items, and references
 *  - Timing-safe string comparison (prevent timing-attack on HMAC checks)
 *  - Request body size guard
 */

import { z } from 'zod'
import crypto from 'crypto'

// ── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Strip HTML tags, null bytes, and leading/trailing whitespace.
 * Used on all free-text fields before they are stored in Sanity.
 * Sanity's portable text already escapes output, but we sanitise at
 * ingestion so that the admin panel is also safe.
 */
export function sanitiseText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // strip control chars (keep \t \n \r)
    .trim()
}

/**
 * Sanitise an entire object's string leaves recursively.
 * Protects against GROQ / stored XSS in nested objects like `customer`.
 */
export function sanitiseObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      result[k] = sanitiseText(v)
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = sanitiseObject(v as Record<string, unknown>)
    } else {
      result[k] = v
    }
  }
  return result as T
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

/** Paystack reference — alphanumeric + hyphens/underscores only */
export const paystackReferenceSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9\-_]+$/, 'Invalid reference format')

/** Single order line item — server validates structure and positive numbers */
export const orderItemSchema = z.object({
  productId: z.string().min(1).max(100),
  title:     z.string().min(1).max(300).transform(sanitiseText),
  size:      z.string().max(20).optional(),
  quantity:  z.number().int().min(1).max(100),   // cap at 100 per line
  price:     z.number().positive().max(100_000),  // max GH¢100,000 per item
  imageUrl:  z.string().url().optional().or(z.literal('')),
  slug:      z.string().min(1).max(200),
})

/** Customer details — sanitised strings, valid email/phone shapes */
export const customerSchema = z.object({
  name:    z.string().min(2).max(120).transform(sanitiseText),
  email:   z.string().email().max(254).transform(s => s.toLowerCase().trim()),
  phone:   z.string().max(30).regex(/^[+\d\s\-().]*$/, 'Invalid phone').transform(sanitiseText),
  address: z.string().max(500).transform(sanitiseText),
})

/** Full order creation body */
export const createOrderSchema = z.object({
  reference:   paystackReferenceSchema,
  items:       z.array(orderItemSchema).min(1).max(50),
  subtotal:    z.number().nonnegative().max(10_000_000),
  shippingFee: z.number().nonnegative().max(10_000),
  total:       z.number().positive().max(10_000_000),
  shippingZone: z.string().max(100).transform(sanitiseText),
  customer:    customerSchema,
})

/** Pending (WhatsApp) order body */
export const pendingOrderSchema = z.object({
  items:       z.array(orderItemSchema).min(1).max(50),
  subtotal:    z.number().nonnegative().max(10_000_000),
  shippingFee: z.number().nonnegative().max(10_000),
  total:       z.number().positive().max(10_000_000),
  shippingZone: z.string().max(100).transform(sanitiseText),
  customer:    customerSchema,
})

/** Contact inquiry */
export const contactSchema = z.object({
  name:    z.string().min(2).max(120).transform(sanitiseText),
  email:   z.string().email().max(254).transform(s => s.toLowerCase().trim()),
  message: z.string().min(10).max(5000).transform(sanitiseText),
})

/** Newsletter subscribe */
export const subscribeSchema = z.object({
  email: z.string().email().max(254).transform(s => s.toLowerCase().trim()),
})

// ── Crypto helpers ───────────────────────────────────────────────────────────

/**
 * Timing-safe string equality.
 * Prevents side-channel attacks when comparing HMAC signatures.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison on equal-length dummy strings to prevent length leaks
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a))
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

/**
 * Generate a cryptographically secure order reference.
 * Format: SW-<timestamp36>-<8 random hex chars>
 * Collision probability: ~1 in 4 billion at same millisecond → negligible.
 */
export function generateSecureOrderNumber(): string {
  const ts   = Date.now().toString(36).toUpperCase()   // base-36 timestamp
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `SW-${ts}-${rand}`
}

// ── Body size guard ──────────────────────────────────────────────────────────

/**
 * Reject requests whose JSON body exceeds `maxBytes`.
 * Prevents memory-exhaustion via giant payloads.
 * Call before req.json() for any POST endpoint.
 */
export function checkBodySize(req: Request, maxBytes = 32_768): boolean {
  const contentLength = req.headers.get('content-length')
  if (!contentLength) return true // no header → let JSON parse handle it
  return parseInt(contentLength, 10) <= maxBytes
}
