import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { serverClient } from '@/sanity/client'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const secret = process.env.PAYSTACK_SECRET_KEY ?? ''

  // Validate HMAC SHA512
  const expected = crypto.createHmac('sha512', secret).update(body).digest('hex')
  if (signature !== expected) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === 'charge.success') {
    const reference = event.data?.reference
    if (reference) {
      const docs = await serverClient.fetch(
        `*[_type == "order" && paymentRef == $ref][0]._id`,
        { ref: reference }
      )
      if (docs) {
        await serverClient.patch(docs).set({ paymentStatus: 'success', status: 'confirmed' }).commit()
      }
    }
  }

  return NextResponse.json({ received: true })
}
