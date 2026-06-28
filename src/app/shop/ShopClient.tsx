'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { client } from '@/sanity/client'
import { allProductsQuery, allProductsCountQuery } from '@/sanity/queries'
import type { Category, Product } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import { IconClose } from '@/components/ui/Icons'
import s from './shop.module.css'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'new',        label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

interface Props {
  categories: Category[]
  initialCategory?: string
  initialSort?: string
  initialMinPrice?: number
  initialMaxPrice?: number
}

export default function ShopClient({
  categories,
  initialCategory,
  initialSort,
  initialMinPrice,
  initialMaxPrice,
}: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const [products,     setProducts]     = useState<Product[]>([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  const [category, setCategory] = useState(initialCategory ?? '')
  const [sort,     setSort]     = useState(initialSort ?? 'new')
  const [minPrice, setMinPrice] = useState(initialMinPrice ?? 0)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice ?? 0)
  const offsetRef = useRef(0)

  const pushUrl = useCallback((cat: string, s: string) => {
    const p = new URLSearchParams(searchParams.toString())
    cat ? p.set('category', cat) : p.delete('category')
    s && s !== 'new' ? p.set('sort', s) : p.delete('sort')
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const load = useCallback(async (reset: boolean) => {
    const off = reset ? 0 : offsetRef.current
    reset ? setLoading(true) : setLoadingMore(true)

    const params = {
      category: category || null,
      sort,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      offset: off,
      limit: off + PAGE_SIZE,
    }

    const [prods, count] = await Promise.all([
      client.fetch(allProductsQuery, params),
      reset ? client.fetch(allProductsCountQuery, {
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      }) : Promise.resolve(total),
    ])

    if (reset) {
      setProducts(prods)
      setTotal(count)
      offsetRef.current = PAGE_SIZE
    } else {
      setProducts(prev => [...prev, ...prods])
      offsetRef.current = off + PAGE_SIZE
    }

    reset ? setLoading(false) : setLoadingMore(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, minPrice, maxPrice])

  useEffect(() => { load(true) }, [load])

  const handleCategory = (val: string) => {
    setCategory(val); pushUrl(val, sort)
  }
  const handleSort = (val: string) => {
    setSort(val); pushUrl(category, val)
  }

  const activeCategory = categories.find(c => c.slug.current === category)
  const pageTitle      = activeCategory?.title ?? 'All'

  return (
    <div className={s.page}>
      {/* Page header */}
      <div className={s.pageHead}>
        <h1 className={s.pageTitle}>{pageTitle}</h1>
        {!loading && (
          <span className={s.pieceCount}>
            {total} {total === 1 ? 'piece' : 'pieces'}
          </span>
        )}
      </div>

      <div className={s.layout}>
        {/* ── Desktop sidebar ── */}
        <aside className={s.sidebar} aria-label="Filters">
          <FilterPanel
            categories={categories}
            category={category}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategory={handleCategory}
            onSort={handleSort}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
          />
        </aside>

        {/* ── Product grid ── */}
        <div className={s.productArea}>
          {/* Mobile toolbar */}
          <div className={s.mobileBar}>
            <button
              type="button"
              className={s.mobileFilterBtn}
              onClick={() => setDrawerOpen(true)}
            >
              Filter{category ? ` · 1` : ''}
            </button>
            <select
              className={s.sortSelect}
              value={sort}
              onChange={e => handleSort(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className={s.skeleton}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={s.skeletonCard}>
                  <div className={s.skeletonImage} />
                  <div className={s.skeletonLine} />
                  <div className={s.skeletonLineShort} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={s.empty}>
              <p className={s.emptyText}>Nothing here yet.</p>
              <button
                type="button"
                className={s.emptyAction}
                onClick={() => handleCategory('')}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className={s.grid}>
                {products.map((p, i) => (
                  <ProductCard key={p._id} product={p} priority={i < 4} />
                ))}
              </div>

              {products.length < total && (
                <div className={s.loadMore}>
                  <button
                    type="button"
                    onClick={() => load(false)}
                    disabled={loadingMore}
                    className="btn-outline"
                  >
                    {loadingMore ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <>
          <div
            className={s.drawerBackdrop}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className={s.drawer}
            role="dialog"
            aria-label="Filter products"
            aria-modal="true"
          >
            <div className={s.drawerHead}>
              <span className={s.drawerTitle}>Filter</span>
              <button
                type="button"
                className={s.drawerClose}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <IconClose size={18} />
              </button>
            </div>
            <div className={s.drawerBody}>
              <FilterPanel
                categories={categories}
                category={category}
                sort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategory={v => { handleCategory(v); setDrawerOpen(false) }}
                onSort={v => { handleSort(v); setDrawerOpen(false) }}
                onMinPrice={setMinPrice}
                onMaxPrice={setMaxPrice}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FilterPanel({
  categories, category, sort, minPrice, maxPrice,
  onCategory, onSort, onMinPrice, onMaxPrice,
}: {
  categories: Category[]
  category: string
  sort: string
  minPrice: number
  maxPrice: number
  onCategory: (v: string) => void
  onSort: (v: string) => void
  onMinPrice: (v: number) => void
  onMaxPrice: (v: number) => void
}) {
  return (
    <>
      {/* Sort */}
      <div className={s.filterGroup}>
        <span className={s.filterLabel}>Sort</span>
        <div className={s.filterOptions}>
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              className={s.filterOption}
              data-active={sort === o.value ? 'true' : 'false'}
              onClick={() => onSort(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className={s.filterGroup}>
        <span className={s.filterLabel}>Category</span>
        <div className={s.filterOptions}>
          <button
            type="button"
            className={s.filterOption}
            data-active={!category ? 'true' : 'false'}
            onClick={() => onCategory('')}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              type="button"
              className={s.filterOption}
              data-active={category === c.slug.current ? 'true' : 'false'}
              onClick={() => onCategory(c.slug.current)}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={s.filterGroup}>
        <span className={s.filterLabel}>Price (GH¢)</span>
        <div className={s.priceRow}>
          <input
            type="number"
            className={s.priceInput}
            value={minPrice || ''}
            onChange={e => onMinPrice(Number(e.target.value))}
            placeholder="Min"
            aria-label="Minimum price"
            min={0}
          />
          <span className={s.priceSep}>–</span>
          <input
            type="number"
            className={s.priceInput}
            value={maxPrice || ''}
            onChange={e => onMaxPrice(Number(e.target.value))}
            placeholder="Max"
            aria-label="Maximum price"
            min={0}
          />
        </div>
      </div>
    </>
  )
}
