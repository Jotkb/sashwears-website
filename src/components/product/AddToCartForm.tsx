'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'
import SizeGuideModal from './SizeGuideModal'

interface Props {
  product: Product
  imageUrl?: string
}

export default function AddToCartForm({ product, imageUrl }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.length === 1 ? product.sizes[0] : undefined
  )
  const [qty, setQty] = useState(1)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()

  const requiresSize = product.sizes && product.sizes.length > 0

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) return

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      size: selectedSize,
      quantity: qty,
      imageUrl,
      slug: product.slug.current,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    openCart()
  }

  const outOfStock = (product.stock ?? 1) <= 0

  return (
    <>
      {/* Size selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label" style={{ color: 'var(--color-ink-soft)' }}>Size</span>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="text-label underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
              style={{ fontSize: 10 }}
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className="w-12 h-12 text-sm transition-all"
                style={{
                  border: selectedSize === size ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
                  backgroundColor: selectedSize === size ? 'var(--color-ink)' : 'transparent',
                  color: selectedSize === size ? 'var(--color-ivory)' : 'var(--color-ink)',
                }}
              >
                {size}
              </button>
            ))}
          </div>
          {requiresSize && !selectedSize && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-rose-deep)' }}>Please select a size</p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-label" style={{ color: 'var(--color-ink-soft)' }}>Qty</span>
        <div className="flex items-center gap-3" style={{ border: '1px solid var(--color-line)' }}>
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 flex items-center justify-center text-lg transition-opacity hover:opacity-60"
          >−</button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-10 h-10 flex items-center justify-center text-lg transition-opacity hover:opacity-60"
          >+</button>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || (requiresSize ? !selectedSize : false)}
          className="btn-primary w-full"
          style={outOfStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
        >
          {outOfStock ? 'Out of Stock' : added ? 'Added to Bag' : 'Add to Bag'}
        </button>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Hi Sashwears, I'm interested in: ${product.title}${selectedSize ? ` (Size ${selectedSize})` : ''} — GH¢${product.price}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full text-center"
        >
          Message on WhatsApp
        </a>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  )
}
