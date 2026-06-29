import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { orderByIdQuery } from '@/sanity/queries'
import type { Order } from '@/types'
import OrderConfirmClient from './OrderConfirmClient'
import s from './order.module.css'

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
    pending:    'Received',
    confirmed:  'Confirmed',
    processing: 'Being Prepared',
    shipped:    'Shipped',
    delivered:  'Delivered',
    cancelled:  'Cancelled',
  }

  const paymentClassMap = {
    success: s.badgePaid,
    pending: s.badgePending,
    failed:  s.badgeFailed,
  }

  const paymentLabel = {
    success: 'Paid',
    pending: 'Awaiting Payment',
    failed:  'Payment Failed',
  }[order.paymentStatus]

  return (
    <div className={s.page}>
      <OrderConfirmClient
        order={order}
        paymentLabel={paymentLabel}
        paymentClass={paymentClassMap[order.paymentStatus]}
        statusLabel={statusLabel[order.status]}
      />
    </div>
  )
}
