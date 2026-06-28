'use client'

import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { IconClose, IconMinus, IconPlus, IconArrowRight } from '@/components/ui/Icons'
import s from './cart.module.css'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getTotal } = useCartStore()
  const total     = getTotal()
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const open = isOpen ? 'true' : 'false'

  return (
    <>
      <div
        className={s.backdrop}
        data-open={open}
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Shopping bag"
        aria-modal="true"
        className={s.panel}
        data-open={open}
      >
        {/* ── Header ── */}
        <div className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.title}>Your Bag</span>
            {items.length > 0 && (
              <span className={s.itemCount}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            type="button"
            className={s.closeBtn}
            onClick={closeCart}
            aria-label="Close bag"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className={s.body}>
          {items.length === 0 ? (
            <div className={s.empty}>
              <p className={s.emptyHeading}>Nothing here yet.</p>
              <Link href="/shop" onClick={closeCart} className="btn-ghost">
                Browse the collection
                <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul>
              {items.map(item => (
                <li key={`${item.productId}_${item.size}`} className={s.item}>
                  {/* Thumbnail */}
                  <div className={s.thumb}>
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className={s.itemInfo}>
                    <div>
                      <p className={s.itemName}>{item.title}</p>
                      {item.size && (
                        <p className={s.itemSize}>Size {item.size}</p>
                      )}
                    </div>

                    <div className={s.itemBottom}>
                      {/* Stepper */}
                      <div className={s.stepper}>
                        <button
                          type="button"
                          className={s.stepperBtn}
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className={s.stepperVal}>{item.quantity}</span>
                        <button
                          type="button"
                          className={s.stepperBtn}
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className={s.itemRight}>
                        <span className={s.itemPrice}>
                          GH¢ {(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          className={s.removeBtn}
                          onClick={() => removeItem(item.productId, item.size)}
                          aria-label={`Remove ${item.title}`}
                        >
                          <IconClose size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className={s.footer}>
            <div className={s.subtotalRow}>
              <span className={s.subtotalLabel}>Subtotal</span>
              <span className={s.subtotalAmount}>GH¢ {total.toLocaleString()}</span>
            </div>
            <p className={s.shippingNote}>Shipping calculated at checkout.</p>
            <Link href="/cart" onClick={closeCart} className={s.cta}>
              <span>Proceed to Checkout</span>
              <IconArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
