import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/client'
import { contactSchema, checkBodySize } from '@/lib/security'

export async function POST(req: NextRequest) {
  if (!checkBodySize(req, 8_192)) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Zod validates types + lengths; transform() sanitises text fields
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await serverClient.create({
      _type:     'inquiry',
      ...parsed.data,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Could not submit message' }, { status: 500 })
  }
}
