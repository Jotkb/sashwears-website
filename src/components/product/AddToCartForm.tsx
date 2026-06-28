'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'
import SizeGuideModal from './SizeGuideModal'
import { IconMinus, IconPlus, IconCheck, IconWhatsApp } from '@/components/ui/Icons'
import s from './product.module.css'

interface Props {
  product: Product
  imageUrl?: string
}

export default function AddToCartForm({ product, imageUrl }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.length === 1 ? product.sizes[0] : undefined
  )
  const [qty, setQty]                     = useState(1)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [added, setAdded]                 = useState(false)
  const { addItem, openCart }             = useCartStore()

  const requiresSize = !!(product.sizes && product.sizes.length > 0)
  const outOfStock   = (product.stock ?? 1) <= 0
  const canAdd       = !outOfStock && (!requiresSize || !!selectedSize)

  const handleAdd = () => {
    if (!canAdd) return
    addItem({
      productId: product._id,
      title:     product.title,
      price:     product.price,
      size:      selectedSize,
      quantity:  qty,
      imageUrl,
      slug:      product.slug.current,
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2500)
  }

  const waText = encodeURIComponent(
    `Hi Sashwears, I'm interested in: ${product.title}${selectedSize ? ` (Size ${selectedSize})` : ''} — GH¢${product.price}`
  )

  return (
    <>
      {/* Size selector */}
      {requiresSize && (
        <div className={s.sizeSectionWrap}>
          <div className={s.sizeHeader}>
            <span className={s.sizeLabel}>Size</span>
            <button
              type="button"
              className={s.sizeGuideBtn}
              onClick={() => setSizeGuideOpen(true)}
            >
              Size Guide
            </button>
          </div>

          <div className={s.sizeGrid}>
            {product.sizes!.map(size => (
              <button
                key={size}
                type="button"
                className={s.sizeBtn}
                data-active={selectedSize === size ? 'true' : 'false'}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size ? 'true' : 'false'}
                aria-label={`Size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>

          {requiresSize && !selectedSize && (
            <p className={s.sizeError} role="alert">Please select a size to continue</p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className={s.qtyRow}>
        <span className={s.qtyLabel}>Qty</span>
        <div className={s.qtyStepper}>
          <button
            type="button"
            className={s.qtyBtn}
            onClick={() => setQty(q => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            disabled={qty <= 1}
          >
            <IconMinus size={14} />
          </button>
          <span className={s.qtyVal} aria-live="polite" aria-label={`Quantity: ${qty}`}>
            {qty}
          </span>
          <button
            type="button"
            className={s.qtyBtn}
            onClick={() => setQty(q => q + 1)}
            aria-label="Increase quantity"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className={s.ctaStack}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || (requiresSize && !selectedSize)}
          className={`btn-primary ${s.addBtn}${added ? ` ${s.addedState}` : ''}${outOfStock ? ` ${s.addBtnDisabled}` : ''}`}
          aria-live="polite"
        >
          {outOfStock ? (
            'Out of Stock'
          ) : added ? (
            <><IconCheck size={14} />Added to Bag</>
          ) : (
            'Add to Bag'
          )}
        </button>

        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-outline ${s.waBtn}`}
        >
          <IconWhatsApp size={16} />
          Message on WhatsApp
        </a>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  )
}
