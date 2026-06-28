import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/client'
import { generateOrderNumber } from '@/lib/paystack'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, subtotal, shippingFee, total, shippingZone, customer } = body

    const orderNumber = generateOrderNumber()

    await serverClient.create({
      _type: 'order',
      orderNumber,
      items: items ?? [],
      subtotal: subtotal ?? 0,
      shippingFee: shippingFee ?? 0,
      total: total ?? 0,
      paymentStatus: 'pending',
      customer: customer ?? {},
      shippingZone,
      status: 'pending',
      isPendingWhatsApp: true,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    console.error('[orders/pending]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
