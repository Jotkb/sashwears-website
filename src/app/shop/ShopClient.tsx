'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { client } from '@/sanity/client'
import { allProductsQuery, allProductsCountQuery } from '@/sanity/queries'
import type { Category, Product } from '@/types'
import ProductCard from '@/components/product/ProductCard'

const PAGE_SIZE = 12

interface Props {
  categories: Category[]
  initialCategory?: string
  initialSort?: string
  initialMinPrice?: number
  initialMaxPrice?: number
}

export default function ShopClient({ categories, initialCategory, initialSort, initialMinPrice, initialMaxPrice }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const [category, setCategory] = useState(initialCategory ?? '')
  const [sort, setSort] = useState(initialSort ?? 'new')
  const [minPrice, setMinPrice] = useState(initialMinPrice ?? 0)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice ?? 5000)
  const [offset, setOffset] = useState(0)

  const updateUrl = useCallback((cat: string, s: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) params.set('category', cat); else params.delete('category')
    if (s && s !== 'new') params.set('sort', s); else params.delete('sort')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const fetchProducts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset
    reset ? setLoading(true) : setLoadingMore(true)

    const [prods, count] = await Promise.all([
      client.fetch(allProductsQuery, {
        category: category || null,
        sort,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        offset: currentOffset,
        limit: currentOffset + PAGE_SIZE,
      }),
      client.fetch(allProductsCountQuery, {
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      }),
    ])

    if (reset) {
      setProducts(prods)
      setOffset(PAGE_SIZE)
    } else {
      setProducts((prev) => [...prev, ...prods])
      setOffset((prev) => prev + PAGE_SIZE)
    }
    setTotal(count)
    reset ? setLoading(false) : setLoadingMore(false)
  }, [category, sort, minPrice, maxPrice, offset])

  useEffect(() => {
    fetchProducts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, minPrice, maxPrice])

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setOffset(0)
    updateUrl(val, sort)
  }

  const handleSortChange = (val: string) => {
    setSort(val)
    setOffset(0)
    updateUrl(category, val)
  }

  const sortOptions = [
    { value: 'new', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ]

  return (
    <div className="max-w-[1536px] mx-auto px-6 lg:px-12 section-padding">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-10">
        <h1 className="font-display text-4xl lg:text-6xl">
          {category ? categories.find((c) => c.slug.current === category)?.title ?? 'Shop' : 'All'}
        </h1>
        <span className="text-label" style={{ color: 'var(--color-ink-soft)' }}>
          {total} pieces
        </span>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <FilterPanel
            categories={categories}
            category={category}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortOptions={sortOptions}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Mobile filter bar */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button
              onClick={() => setFilterOpen(true)}
              className="text-label"
              style={{ border: '1px solid var(--color-line)', padding: '8px 16px' }}
            >
              Filter
            </button>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-label bg-transparent outline-none"
              style={{ border: '1px solid var(--color-line)', padding: '8px 12px' }}
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full" style={{ aspectRatio: '4/5', backgroundColor: 'var(--color-cream)' }} />
                  <div className="h-4 mt-3 w-3/4 rounded" style={{ backgroundColor: 'var(--color-cream)' }} />
                  <div className="h-3 mt-2 w-1/3 rounded" style={{ backgroundColor: 'var(--color-cream)' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="font-display text-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                Nothing here yet
              </p>
              <button onClick={() => handleCategoryChange('')} className="text-label underline underline-offset-4">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} priority={i < 4} />
                ))}
              </div>

              {products.length < total && (
                <div className="flex justify-center mt-14">
                  <button
                    onClick={() => fetchProducts(false)}
                    disabled={loadingMore}
                    className="btn-outline"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(28,26,24,0.4)' }} onClick={() => setFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-[60] w-80 overflow-y-auto p-8" style={{ backgroundColor: 'var(--color-ivory)' }}>
            <div className="flex justify-between items-center mb-8">
              <span className="font-display text-xl">Filter</span>
              <button onClick={() => setFilterOpen(false)} className="text-label opacity-60">Close</button>
            </div>
            <FilterPanel
              categories={categories}
              category={category}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sortOptions={sortOptions}
              onCategoryChange={(v) => { handleCategoryChange(v); setFilterOpen(false) }}
              onSortChange={(v) => { handleSortChange(v); setFilterOpen(false) }}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </div>
        </>
      )}
    </div>
  )
}

function FilterPanel({
  categories, category, sort, minPrice, maxPrice, sortOptions,
  onCategoryChange, onSortChange, onMinPriceChange, onMaxPriceChange,
}: {
  categories: Category[]
  category: string
  sort: string
  minPrice: number
  maxPrice: number
  sortOptions: { value: string; label: string }[]
  onCategoryChange: (v: string) => void
  onSortChange: (v: string) => void
  onMinPriceChange: (v: number) => void
  onMaxPriceChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Sort */}
      <div>
        <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Sort</p>
        <div className="flex flex-col gap-2">
          {sortOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => onSortChange(o.value)}
              className="text-sm text-left transition-opacity"
              style={{ opacity: sort === o.value ? 1 : 0.5, fontWeight: sort === o.value ? 500 : 400 }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Category</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className="text-sm text-left transition-opacity"
            style={{ opacity: !category ? 1 : 0.5, fontWeight: !category ? 500 : 400 }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => onCategoryChange(c.slug.current)}
              className="text-sm text-left transition-opacity"
              style={{ opacity: category === c.slug.current ? 1 : 0.5, fontWeight: category === c.slug.current ? 500 : 400 }}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-label mb-4" style={{ color: 'var(--color-ink-soft)' }}>Price (GH¢)</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={minPrice || ''}
            onChange={(e) => onMinPriceChange(Number(e.target.value))}
            placeholder="Min"
            className="w-full px-2 py-1 text-sm outline-none"
            style={{ border: '1px solid var(--color-line)', background: 'transparent' }}
          />
          <span className="text-sm opacity-40">–</span>
          <input
            type="number"
            value={maxPrice || ''}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            placeholder="Max"
            className="w-full px-2 py-1 text-sm outline-none"
            style={{ border: '1px solid var(--color-line)', background: 'transparent' }}
          />
        </div>
      </div>
    </div>
  )
}
