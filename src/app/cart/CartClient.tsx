'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import type { ShippingZone } from '@/types'

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void }
    }
  }
}

interface Props {
  shippingZones: ShippingZone[]
  whatsappNumber?: string
}

export default function CartClient({ shippingZones, whatsappNumber }: Props) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const router = useRouter()

  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(shippingZones[0] ?? null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paying, setPaying] = useState(false)

  const subtotal = getTotal()
  const shippingFee = selectedZone?.flatRate ?? 0
  const total = subtotal + shippingFee

  // Load Paystack inline script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handlePaystack = async () => {
    if (!customerEmail || !customerName) {
      alert('Please enter your name and email before paying.')
      return
    }
    if (items.length === 0) return

    setPaying(true)

    const reference = `SW-${Date.now()}`

    const handler = window.PaystackPop?.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: customerEmail,
      amount: total * 100, // pesewas
      currency: 'GHS',
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
          { display_name: 'Phone', variable_name: 'phone', value: customerPhone },
        ],
      },
      callback: async (response: { reference: string }) => {
        try {
          const res = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.reference,
              items,
              subtotal,
              shippingFee,
              total,
              shippingZone: selectedZone?.name,
              customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: selectedZone?.name ?? '',
              },
            }),
          })
          const data = await res.json()
          if (data.orderNumber) {
            clearCart()
            router.push(`/order/${data.orderNumber}`)
          }
        } catch {
          alert('Payment confirmed but order creation failed. Please contact us with reference: ' + response.reference)
        }
        setPaying(false)
      },
      onClose: () => setPaying(false),
    })

    handler?.openIframe()
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      (i) => `• ${i.title}${i.size ? ` — Size ${i.size}` : ''} × ${i.quantity} — GH¢${(i.price * i.quantity).toLocaleString()}`
    )
    return [
      'Hi Sashwears, I\'d like to place an order:',
      '',
      ...lines,
      '',
      `Subtotal: GH¢${subtotal.toLocaleString()}`,
      `Delivery: ${selectedZone?.name ?? 'TBD'} (GH¢${shippingFee})`,
      `Total: GH¢${total.toLocaleString()}`,
      '',
      `Name: ${customerName || '[your name]'}`,
      `Phone: ${customerPhone || '[your phone]'}`,
    ].join('\n')
  }

  const handleWhatsApp = async () => {
    const message = buildWhatsAppMessage()
    const number = whatsappNumber || '233000000000'

    // Save pending order to Sanity
    try {
      await fetch('/api/orders/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal,
          shippingFee,
          total,
          shippingZone: selectedZone?.name,
          customer: { name: customerName, phone: customerPhone, email: customerEmail, address: selectedZone?.name ?? '' },
        }),
      })
    } catch {
      // Non-blocking
    }

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
        <p className="font-display text-3xl" style={{ color: 'var(--color-ink-soft)' }}>Your bag is empty</p>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-line)',
    outline: 'none',
    fontSize: 14,
    color: 'var(--color-ink)',
  }

  return (
    <div className="max-w-[1536px] mx-auto px-6 lg:px-12 section-padding">
      <h1 className="font-display text-4xl lg:text-6xl mb-12">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
        {/* Line Items */}
        <div>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li
                key={`${item.productId}_${item.size}`}
                className="flex gap-6 py-6"
                style={{ borderBottom: '1px solid var(--color-line)' }}
              >
                <div className="relative w-24 h-32 flex-shrink-0" style={{ backgroundColor: 'var(--color-cream)' }}>
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/shop/${item.slug}`} className="font-display text-lg hover:opacity-70 transition-opacity">
                        {item.title}
                      </Link>
                      {item.size && (
                        <p className="text-label mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>Size {item.size}</p>
                      )}
                    </div>
                    <span className="font-display text-lg whitespace-nowrap">
                      GH¢ {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3" style={{ border: '1px solid var(--color-line)' }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
                      >−</button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-label opacity-40 hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary + Checkout */}
        <div>
          <div className="sticky top-20">
            {/* Customer info */}
            <div className="mb-8">
              <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Your Details</p>
              <div className="flex flex-col gap-4">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name *" style={inputStyle} />
                <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" placeholder="Email address *" style={inputStyle} />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" style={inputStyle} />
              </div>
            </div>

            {/* Shipping Zone */}
            {shippingZones.length > 0 && (
              <div className="mb-8">
                <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Delivery Location</p>
                <div className="flex flex-col gap-2">
                  {shippingZones.map((zone) => (
                    <label key={zone._id} className="flex items-center justify-between cursor-pointer py-2" style={{ borderBottom: '1px solid var(--color-line)' }}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="zone"
                          checked={selectedZone?._id === zone._id}
                          onChange={() => setSelectedZone(zone)}
                          style={{ accentColor: 'var(--color-ink)' }}
                        />
                        <div>
                          <span className="text-sm">{zone.name}</span>
                          {zone.estimatedDays && (
                            <span className="text-xs ml-2" style={{ color: 'var(--color-ink-soft)' }}>{zone.estimatedDays}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm">GH¢ {zone.flatRate}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="mb-8 flex flex-col gap-2">
              <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                <span>Subtotal</span>
                <span>GH¢ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                <span>Shipping</span>
                <span>GH¢ {shippingFee}</span>
              </div>
              <div className="flex justify-between font-display text-xl mt-2 pt-3" style={{ borderTop: '1px solid var(--color-line)' }}>
                <span>Total</span>
                <span>GH¢ {total.toLocaleString()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button onClick={handlePaystack} disabled={paying} className="btn-primary w-full">
                {paying ? 'Processing...' : 'Pay with Paystack'}
              </button>
              <button onClick={handleWhatsApp} className="btn-outline w-full">
                Checkout via WhatsApp
              </button>
            </div>

            <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-ink-soft)' }}>
              Payments secured by Paystack. Supports cards, MTN MoMo, Telecel & AirtelTigo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
