import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/server-client'
import { subscribeSchema, checkBodySize } from '@/lib/security'

export async function POST(req: NextRequest) {
  if (!checkBodySize(req, 2_048)) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const email = parsed.data.email

  try {
    // ── Deduplicate — silently succeed if already subscribed ──────────────
    const existing = await serverClient.fetch<{ _id: string } | null>(
      `*[_type == "subscriber" && email == $email][0]{_id}`,
      { email }
    )

    if (!existing?._id) {
      await serverClient.create({
        _type:     'subscriber',
        email,
        createdAt: new Date().toISOString(),
      })
    }

    // Always return success — don't reveal whether email already exists
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe]', err)
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 })
  }
}
