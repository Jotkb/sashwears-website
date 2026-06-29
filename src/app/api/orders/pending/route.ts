import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/client'
import { generateSecureOrderNumber, pendingOrderSchema, checkBodySize } from '@/lib/security'

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
  const parsed = pendingOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }

  const { items, subtotal, shippingFee, total, shippingZone, customer } = parsed.data

  // ── Server-side total cross-check ─────────────────────────────────────────
  const calculatedSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const calculatedTotal    = calculatedSubtotal + shippingFee

  // Allow ±1 pesewa rounding tolerance
  if (
    Math.abs(calculatedSubtotal - subtotal) > 0.01 ||
    Math.abs(calculatedTotal    - total)    > 0.01
  ) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  }

  try {
    const orderNumber = generateSecureOrderNumber()

    await serverClient.create({
      _type: 'order',
      orderNumber,
      items,
      subtotal,
      shippingFee,
      total,
      paymentStatus:     'pending',
      customer,
      shippingZone,
      status:            'pending',
      isPendingWhatsApp: true,
      createdAt:         new Date().toISOString(),
    })

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    console.error('[orders/pending]', err)
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 })
  }
}
