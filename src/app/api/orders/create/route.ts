import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/client'
import { verifyPaystackTransaction, generateOrderNumber } from '@/lib/paystack'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reference, items, subtotal, shippingFee, total, shippingZone, customer } = body

    if (!reference || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify payment with Paystack
    const txn = await verifyPaystackTransaction(reference)

    if (txn.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 402 })
    }

    // Verify amount matches (allow ±1 pesewa for rounding)
    const expectedPesewas = Math.round(total * 100)
    if (Math.abs(txn.amount - expectedPesewas) > 1) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 402 })
    }

    const orderNumber = generateOrderNumber()

    await serverClient.create({
      _type: 'order',
      orderNumber,
      items,
      subtotal,
      shippingFee,
      total,
      paymentRef: reference,
      paymentStatus: 'success',
      customer,
      shippingZone,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    console.error('[orders/create]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
