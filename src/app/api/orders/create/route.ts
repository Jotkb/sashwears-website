import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/client'
import { verifyPaystackTransaction } from '@/lib/paystack'
import {
  createOrderSchema,
  generateSecureOrderNumber,
  checkBodySize,
} from '@/lib/security'

export async function POST(req: NextRequest) {
  // ── Body size guard (max 32 KB) ───────────────────────────────────────────
  if (!checkBodySize(req)) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Validate and sanitise all input via Zod ───────────────────────────────
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }

  const { reference, items, shippingFee, shippingZone, customer } = parsed.data

  try {
    // ── Idempotency: reject duplicate references ───────────────────────────
    const existing = await serverClient.fetch<{ _id: string } | null>(
      `*[_type == "order" && paymentRef == $ref][0]{_id}`,
      { ref: reference }
    )
    if (existing?._id) {
      // Order already created — return success idempotently
      const existingOrder = await serverClient.fetch<{ orderNumber: string } | null>(
        `*[_type == "order" && paymentRef == $ref][0]{orderNumber}`,
        { ref: reference }
      )
      return NextResponse.json(
        { orderNumber: existingOrder?.orderNumber },
        { status: 200 }
      )
    }

    // ── Verify payment with Paystack (server-to-server) ────────────────────
    const txn = await verifyPaystackTransaction(reference)

    if (txn.status !== 'success') {
      // Generic message — don't reveal payment system internals
      return NextResponse.json({ error: 'Order could not be created' }, { status: 402 })
    }

    // ── Recalculate subtotal server-side from Paystack-verified items ──────
    // We use the Paystack-verified total as ground truth, not the client total.
    // The client subtotal is only used for display; the real authority is txn.amount.
    const verifiedTotalPesewas = txn.amount  // what Paystack actually charged
    const clientSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const clientTotalPesewas = Math.round((clientSubtotal + shippingFee) * 100)

    // Allow ±1 pesewa for floating-point rounding only
    if (Math.abs(verifiedTotalPesewas - clientTotalPesewas) > 1) {
      console.warn('[orders/create] amount mismatch', {
        verified: verifiedTotalPesewas,
        client:   clientTotalPesewas,
        ref:      reference,
      })
      return NextResponse.json({ error: 'Order could not be created' }, { status: 402 })
    }

    const subtotal = clientSubtotal
    const total    = clientSubtotal + shippingFee

    // ── Create order in Sanity ─────────────────────────────────────────────
    const orderNumber = generateSecureOrderNumber()

    await serverClient.create({
      _type: 'order',
      orderNumber,
      items,
      subtotal,
      shippingFee,
      total,
      paymentRef:    reference,
      paymentStatus: 'success',
      customer,
      shippingZone,
      status:        'confirmed',
      createdAt:     new Date().toISOString(),
    })

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    // Log server-side but return a generic message to the client
    console.error('[orders/create]', err)
    return NextResponse.json({ error: 'Order could not be created' }, { status: 500 })
  }
}
