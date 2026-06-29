'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import type { ShippingZone } from '@/types'
import s from './cart-page.module.css'

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

const ease = [0.16, 1, 0.3, 1] as const

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
}

const summaryVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay: 0.2 } },
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
      amount: total * 100,
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

  return (
    <div className={s.page}>
      {/* Page header */}
      <motion.div
        className={s.pageHead}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <span className={s.pageEyebrow}>Your Selection</span>
        <h1 className={s.pageTitle}>Your Bag</h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            className={s.empty}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className={s.emptyTitle}>Your bag is empty.</p>
            <p className={s.emptySubtitle}>Nothing here yet — the collection awaits.</p>
            <Link href="/shop" className="btn-primary">Browse the Collection</Link>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className={s.layout}
            initial="hidden"
            animate="show"
          >
            {/* ── Items column ──────────────────────────────── */}
            <motion.ul className={s.itemsList} variants={listVariants}>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={`${item.productId}_${item.size}`}
                    className={s.item}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: 32, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    layout
                    transition={{ duration: 0.4, ease }}
                  >
                    {/* Thumbnail */}
                    <div className={s.thumb}>
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className={s.itemInfo}>
                      <div className={s.itemTop}>
                        <div>
                          <Link href={`/shop/${item.slug}`} className={s.itemNameLink}>
                            <span className={s.itemName}>{item.title}</span>
                          </Link>
                          {item.size && (
                            <span className={s.itemSizeLabel}>Size {item.size}</span>
                          )}
                        </div>
                        <span className={s.itemPrice}>
                          GH¢ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <div className={s.itemBottom}>
                        {/* Quantity stepper */}
                        <div className={s.stepper}>
                          <button
                            type="button"
                            className={s.stepperBtn}
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <motion.span
                            key={item.quantity}
                            className={s.stepperVal}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <button
                            type="button"
                            className={s.stepperBtn}
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className={s.removeBtn}
                          onClick={() => removeItem(item.productId, item.size)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            {/* ── Summary column ────────────────────────────── */}
            <motion.div className={s.summary} variants={summaryVariants}>
              <span className={s.summaryTitle}>Order Summary</span>

              {/* Customer details */}
              <div className={s.fieldGroup}>
                <span className={s.fieldLabel}>Your Details</span>
                <input
                  className={s.textInput}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name *"
                />
                <input
                  className={s.textInput}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  type="email"
                  placeholder="Email address *"
                />
                <input
                  className={s.textInput}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              {/* Shipping zones */}
              {shippingZones.length > 0 && (
                <div>
                  <span className={s.fieldLabel}>Delivery Location</span>
                  <div className={s.zoneList}>
                    {shippingZones.map((zone) => (
                      <label key={zone._id} className={s.zoneRow}>
                        <div className={s.zoneLeft}>
                          <input
                            type="radio"
                            name="zone"
                            className={s.zoneRadio}
                            checked={selectedZone?._id === zone._id}
                            onChange={() => setSelectedZone(zone)}
                          />
                          <span className={s.zoneName}>
                            {zone.name}
                            {zone.estimatedDays && (
                              <span className={s.zoneDays}>{zone.estimatedDays}</span>
                            )}
                          </span>
                        </div>
                        <span className={s.zonePrice}>GH¢ {zone.flatRate}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className={s.totals}>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Subtotal</span>
                  <motion.span
                    key={subtotal}
                    className={s.totalValue}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    GH¢ {subtotal.toLocaleString()}
                  </motion.span>
                </div>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Shipping</span>
                  <span className={s.totalValue}>GH¢ {shippingFee}</span>
                </div>
              </div>

              <div className={s.grandRow}>
                <span className={s.grandLabel}>Total</span>
                <motion.span
                  key={total}
                  className={s.grandValue}
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease }}
                >
                  GH¢ {total.toLocaleString()}
                </motion.span>
              </div>

              {/* CTAs */}
              <div className={s.ctaStack}>
                <button
                  type="button"
                  onClick={handlePaystack}
                  disabled={paying}
                  className={`btn-primary ${s.paystackBtn}`}
                >
                  {paying ? 'Processing…' : 'Pay with Paystack'}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className={`btn-outline ${s.whatsappBtn}`}
                >
                  Checkout via WhatsApp
                </button>
              </div>

              <p className={s.secureNote}>
                Secured by Paystack. Cards, MTN MoMo, Telecel &amp; AirtelTigo.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
