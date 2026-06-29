import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { serverClient } from '@/sanity/client'
import { timingSafeEqual, paystackReferenceSchema } from '@/lib/security'

// Paystack always sends a signature — reject immediately if missing or malformed
export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sigHeader = req.headers.get('x-paystack-signature') ?? ''
  const secret    = process.env.PAYSTACK_SECRET_KEY

  // ── Guard: secret must be configured ─────────────────────────────────────
  if (!secret) {
    console.error('[webhook] PAYSTACK_SECRET_KEY not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // ── HMAC SHA512 verification — timing-safe ────────────────────────────────
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

  if (!sigHeader || !timingSafeEqual(sigHeader, expected)) {
    // Do not reveal why verification failed
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse payload ─────────────────────────────────────────────────────────
  let event: unknown
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (
    typeof event !== 'object' ||
    event === null ||
    !('event' in event) ||
    !('data' in event)
  ) {
    return NextResponse.json({ received: true })
  }

  const evt = event as { event: string; data: Record<string, unknown> }

  if (evt.event === 'charge.success') {
    const reference = evt.data?.reference

    // ── Validate reference format before using in GROQ ────────────────────
    const refParsed = paystackReferenceSchema.safeParse(reference)
    if (!refParsed.success) {
      console.warn('[webhook] invalid reference in payload', { reference })
      return NextResponse.json({ received: true })
    }

    try {
      // Fetch the document ID — explicit null check on result
      const doc = await serverClient.fetch<{ _id: string } | null>(
        `*[_type == "order" && paymentRef == $ref][0]{_id}`,
        { ref: refParsed.data }
      )

      if (doc?._id) {
        await serverClient
          .patch(doc._id)
          .set({ paymentStatus: 'success', status: 'confirmed' })
          .commit()
      } else {
        // Paystack fired before our order was created — this is normal for fast payments;
        // the orders/create route handles idempotency and sets the correct status on creation.
        console.info('[webhook] no matching order found for ref:', refParsed.data)
      }
    } catch (err) {
      console.error('[webhook] Sanity update failed', err)
      // Return 200 to Paystack so it doesn't retry endlessly;
      // our idempotent create route will pick up the correct status.
    }
  }

  // Always acknowledge to Paystack
  return NextResponse.json({ received: true })
}
