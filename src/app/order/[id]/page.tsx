import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { orderByIdQuery } from '@/sanity/queries'
import type { Order } from '@/types'

export const metadata: Metadata = { title: 'Order Confirmation' }
export const revalidate = 30

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params
  const order: Order = await client.fetch(orderByIdQuery, { orderNumber: id }).catch(() => null)

  if (!order) notFound()

  const statusLabel: Record<Order['status'], string> = {
    pending: 'Received',
    confirmed: 'Confirmed',
    processing: 'Being Prepared',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  const paymentBadge = {
    success: { label: 'Paid', color: '#2E7D32' },
    pending: { label: 'Awaiting Payment', color: '#B07A6E' },
    failed: { label: 'Payment Failed', color: '#C62828' },
  }[order.paymentStatus]

  return (
    <div className="pt-[60px]">
      <div className="max-w-2xl mx-auto px-6 lg:px-12 section-padding">
        {/* Header */}
        <div className="mb-10">
          <p className="text-label mb-2" style={{ color: 'var(--color-rose-deep)' }}>Order Confirmation</p>
          <h1 className="font-display text-4xl lg:text-5xl mb-2">Thank you.</h1>
          <p style={{ color: 'var(--color-ink-soft)' }}>
            Order <strong>#{order.orderNumber}</strong> has been received.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3 mb-10">
          <span
            className="text-label px-3 py-1.5"
            style={{ backgroundColor: paymentBadge.color, color: '#FAF7F2' }}
          >
            {paymentBadge.label}
          </span>
          <span className="text-label px-3 py-1.5" style={{ border: '1px solid var(--color-line)' }}>
            {statusLabel[order.status]}
          </span>
        </div>

        {/* Items */}
        <div className="mb-8">
          <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Items Ordered</p>
          <div className="flex flex-col">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-4 text-sm"
                style={{ borderBottom: '1px solid var(--color-line)' }}
              >
                <div>
                  <span>{item.title}</span>
                  {item.size && <span className="ml-2" style={{ color: 'var(--color-ink-soft)' }}>/ {item.size}</span>}
                  <span className="ml-2" style={{ color: 'var(--color-ink-soft)' }}>× {item.quantity}</span>
                </div>
                <span>GH¢ {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            <span>Subtotal</span>
            <span>GH¢ {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            <span>Shipping {order.shippingZone ? `(${order.shippingZone})` : ''}</span>
            <span>GH¢ {order.shippingFee}</span>
          </div>
          <div className="flex justify-between font-display text-xl mt-2 pt-3" style={{ borderTop: '1px solid var(--color-line)' }}>
            <span>Total</span>
            <span>GH¢ {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer */}
        {order.customer && (
          <div className="mb-10 p-6" style={{ backgroundColor: 'var(--color-cream)' }}>
            <p className="text-label mb-3" style={{ color: 'var(--color-ink-soft)' }}>Delivery To</p>
            <p>{order.customer.name}</p>
            {order.customer.address && <p style={{ color: 'var(--color-ink-soft)' }}>{order.customer.address}</p>}
            {order.customer.phone && <p style={{ color: 'var(--color-ink-soft)' }}>{order.customer.phone}</p>}
          </div>
        )}

        {/* What's next */}
        <div className="mb-10">
          <p className="font-display text-2xl mb-3">What happens next?</p>
          <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
            Our team will confirm your order within 24 hours and reach out via WhatsApp or phone
            to arrange delivery. Keep your order number handy: <strong>#{order.orderNumber}</strong>.
          </p>
        </div>

        <Link href="/shop" className="btn-outline">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
