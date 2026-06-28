import type { Metadata } from 'next'
import { client } from '@/sanity/client'
import { categoriesQuery } from '@/sanity/queries'
import type { Category } from '@/types'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of dresses, tops, two-piece sets and shoes.',
}

export const revalidate = 60

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; minPrice?: string; maxPrice?: string }>
}) {
  const params = await searchParams
  const categories: Category[] = await client.fetch(categoriesQuery).catch(() => [])

  return (
    <div className="pt-[60px]">
      <ShopClient
        categories={categories}
        initialCategory={params.category}
        initialSort={params.sort}
        initialMinPrice={params.minPrice ? Number(params.minPrice) : undefined}
        initialMaxPrice={params.maxPrice ? Number(params.maxPrice) : undefined}
      />
    </div>
  )
}
