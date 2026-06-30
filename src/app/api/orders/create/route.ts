import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/server-client'
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

    // ── Re-derive prices from Sanity — never trust client-submitted prices ──
    // The client's `item.price` is display-only; an attacker can edit it
    // (and the matching Paystack charge) together to pay a fraction of the
    // real cost. The catalog price in Sanity is the only source of truth.
    const productIds = [...new Set(items.map(i => i.productId))]
    const catalogProducts = await serverClient.fetch<{ _id: string; price: number }[]>(
      `*[_type == "product" && _id in $ids]{_id, price}`,
      { ids: productIds }
    )
    const priceById = new Map(catalogProducts.map(p => [p._id, p.price]))

    for (const item of items) {
      const catalogPrice = priceById.get(item.productId)
      if (catalogPrice === undefined) {
        return NextResponse.json({ error: 'Order could not be created' }, { status: 400 })
      }
      item.price = catalogPrice
    }

    // ── Recalculate subtotal server-side from catalog-verified items ───────
    // We use the Paystack-verified total as ground truth against the
    // catalog-derived subtotal — not anything the client submitted.
    const verifiedTotalPesewas = txn.amount  // what Paystack actually charged
    const catalogSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const catalogTotalPesewas = Math.round((catalogSubtotal + shippingFee) * 100)

    // Allow ±1 pesewa for floating-point rounding only
    if (Math.abs(verifiedTotalPesewas - catalogTotalPesewas) > 1) {
      console.warn('[orders/create] amount mismatch', {
        verified: verifiedTotalPesewas,
        catalog:  catalogTotalPesewas,
        ref:      reference,
      })
      return NextResponse.json({ error: 'Order could not be created' }, { status: 402 })
    }

    const subtotal = catalogSubtotal
    const total    = catalogSubtotal + shippingFee

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
