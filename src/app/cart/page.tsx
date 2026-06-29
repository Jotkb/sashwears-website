import type { Metadata } from 'next'
import { client } from '@/sanity/client'
import { shippingZonesQuery, siteSettingsQuery } from '@/sanity/queries'
import type { ShippingZone, SiteSettings } from '@/types'
import CartClient from './CartClient'

export const metadata: Metadata = { title: 'Your Bag' }
export const revalidate = 3600

export default async function CartPage() {
  const [zones, settings]: [ShippingZone[], SiteSettings] = await Promise.all([
    client.fetch(shippingZonesQuery).then((r: ShippingZone[] | null) => r ?? []).catch(() => [
      { _id: 'accra', name: 'Accra', flatRate: 30, estimatedDays: '1–2 days' },
      { _id: 'regions', name: 'Other Regions', flatRate: 60, estimatedDays: '3–5 days' },
      { _id: 'international', name: 'International', flatRate: 200, estimatedDays: '7–14 days' },
    ]),
    client.fetch(siteSettingsQuery).then((r: SiteSettings | null) => r ?? {}).catch(() => ({})),
  ])

  return <CartClient shippingZones={zones} whatsappNumber={settings.whatsappNumber} />
}
