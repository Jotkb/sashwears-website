'use client'

import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getTotal } = useCartStore()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const total = getTotal()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ backgroundColor: 'rgba(28,26,24,0.4)' }}
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: 'var(--color-ivory)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--color-line)' }}
        >
          <span className="font-display text-xl">Your Bag</span>
          <button
            onClick={closeCart}
            className="text-label opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="font-display text-2xl" style={{ color: 'var(--color-ink-soft)' }}>
                Your bag is empty
              </p>
              <Link href="/shop" onClick={closeCart} className="text-label underline underline-offset-4">
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item) => (
                <li
                  key={`${item.productId}_${item.size}`}
                  className="flex gap-4"
                  style={{ borderBottom: '1px solid var(--color-line)', paddingBottom: '24px' }}
                >
                  {/* Image */}
                  <div className="relative w-20 h-24 flex-shrink-0" style={{ backgroundColor: 'var(--color-cream)' }}>
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-display text-base">{item.title}</p>
                      {item.size && (
                        <p className="text-label mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
                          Size {item.size}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-lg"
                          style={{ border: '1px solid var(--color-line)' }}
                        >
                          −
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-lg"
                          style={{ border: '1px solid var(--color-line)' }}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-body text-sm">GH¢ {(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-label opacity-40 hover:opacity-100 transition-opacity"
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6" style={{ borderTop: '1px solid var(--color-line)' }}>
            <div className="flex justify-between mb-6">
              <span className="text-label" style={{ color: 'var(--color-ink-soft)' }}>Subtotal</span>
              <span className="font-display text-lg">GH¢ {total.toLocaleString()}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-primary w-full text-center block"
            >
              View Bag & Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
