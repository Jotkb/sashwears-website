'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Order } from '@/types'
import s from './order.module.css'

const ease = [0.16, 1, 0.3, 1] as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
}

interface Props {
  order: Order
  paymentLabel: string
  paymentClass: string
  statusLabel: string
}

export default function OrderConfirmClient({ order, paymentLabel, paymentClass, statusLabel }: Props) {
  return (
    <motion.div
      className={s.inner}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div className={s.head} variants={fadeUp}>
        <span className={s.eyebrow}>Order Confirmation</span>
        <h1 className={s.title}>Thank you.</h1>
        <p className={s.subtitle}>
          Order <strong className={s.orderNum}>#{order.orderNumber}</strong> has been received.
        </p>
      </motion.div>

      {/* Status badges */}
      <motion.div className={s.badges} variants={fadeUp}>
        <span className={`${s.badge} ${paymentClass}`}>{paymentLabel}</span>
        <span className={`${s.badge} ${s.badgeStatus}`}>{statusLabel}</span>
      </motion.div>

      {/* Items */}
      <motion.div className={s.items} variants={fadeUp}>
        <span className={s.sectionLabel}>Items Ordered</span>
        {order.items.map((item, i) => (
          <div key={i} className={s.itemRow}>
            <div className={s.itemLeft}>
              <span className={s.itemTitle}>{item.title}</span>
              {item.size && <span className={s.itemMeta}>/ {item.size}</span>}
              <span className={s.itemMeta}>× {item.quantity}</span>
            </div>
            <span className={s.itemPrice}>
              GH¢ {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Totals */}
      <motion.div className={s.totals} variants={fadeUp}>
        <div className={s.totalRow}>
          <span className={s.totalLabel}>Subtotal</span>
          <span className={s.totalVal}>GH¢ {order.subtotal.toLocaleString()}</span>
        </div>
        <div className={s.totalRow}>
          <span className={s.totalLabel}>
            Shipping{order.shippingZone ? ` (${order.shippingZone})` : ''}
          </span>
          <span className={s.totalVal}>GH¢ {order.shippingFee}</span>
        </div>
        <div className={s.grandRow}>
          <span className={s.grandLabel}>Total</span>
          <span className={s.grandVal}>GH¢ {order.total.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Delivery address */}
      {order.customer && (
        <motion.div className={s.customer} variants={fadeUp}>
          <span className={s.sectionLabel}>Delivery To</span>
          <p className={s.customerLine}>{order.customer.name}</p>
          {order.customer.address && (
            <p className={s.customerLineSub}>{order.customer.address}</p>
          )}
          {order.customer.phone && (
            <p className={s.customerLineSub}>{order.customer.phone}</p>
          )}
        </motion.div>
      )}

      {/* Next steps */}
      <motion.div className={s.next} variants={fadeUp}>
        <p className={s.nextTitle}>What happens next?</p>
        <p className={s.nextBody}>
          Our team will confirm your order within 24 hours and reach out via WhatsApp or
          phone to arrange delivery. Keep your order number handy:{' '}
          <strong className={s.refNum}>#{order.orderNumber}</strong>.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Link href="/shop" className="btn-outline">
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  )
}
