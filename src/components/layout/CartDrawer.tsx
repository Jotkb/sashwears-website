'use client'

import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconClose, IconMinus, IconPlus, IconArrowRight } from '@/components/ui/Icons'
import s from './cart.module.css'

const ease = [0.16, 1, 0.3, 1] as const

const panelVariants = {
  hidden: { x: '100%' },
  show:   { x: '0%', transition: { duration: 0.45, ease } },
  exit:   { x: '100%', transition: { duration: 0.35, ease: [0.4, 0, 1, 1] as const } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
  exit:   { opacity: 0, transition: { duration: 0.25 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  show:   { opacity: 1, x: 0 },
}

const listVariants = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getTotal } = useCartStore()
  const total     = getTotal()
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={s.backdrop}
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-label="Shopping bag"
            aria-modal="true"
            className={s.panel}
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* ── Header ── */}
            <div className={s.header}>
              <div className={s.headerLeft}>
                <span className={s.title}>Your Bag</span>
                {items.length > 0 && (
                  <motion.span
                    className={s.itemCount}
                    key={itemCount}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </motion.span>
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
                <motion.div
                  className={s.empty}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease }}
                >
                  <p className={s.emptyHeading}>Your bag is empty.</p>
                  <Link href="/shop" onClick={closeCart} className="btn-ghost">
                    Browse the collection
                    <IconArrowRight size={14} />
                  </Link>
                </motion.div>
              ) : (
                <motion.ul variants={listVariants} initial="hidden" animate="show">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.li
                        key={`${item.productId}_${item.size}`}
                        className={s.item}
                        variants={itemVariants}
                        exit={{ opacity: 0, x: 32, height: 0, marginBottom: 0, transition: { duration: 0.28 } }}
                        transition={{ duration: 0.4, ease }}
                        layout
                      >
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
                              <motion.span
                                className={s.stepperVal}
                                key={item.quantity}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1,   opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.quantity}
                              </motion.span>
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
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* ── Footer ── */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  className={s.footer}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4, ease }}
                >
                  <div className={s.subtotalRow}>
                    <span className={s.subtotalLabel}>Subtotal</span>
                    <motion.span
                      className={s.subtotalAmount}
                      key={total}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      GH¢ {total.toLocaleString()}
                    </motion.span>
                  </div>
                  <p className={s.shippingNote}>Shipping calculated at checkout.</p>
                  <Link href="/cart" onClick={closeCart} className={s.cta}>
                    <span>Proceed to Checkout</span>
                    <IconArrowRight size={15} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
