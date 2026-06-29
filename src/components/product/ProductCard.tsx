'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { urlFor } from '@/sanity/image'
import type { Product } from '@/types'
import s from './product.module.css'

interface Props {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: Props) {
  const primaryImg   = product.images?.[0]
  const secondaryImg = product.images?.[1]

  const primaryUrl   = primaryImg   ? urlFor(primaryImg).width(640).height(800).url()   : null
  const secondaryUrl = secondaryImg ? urlFor(secondaryImg).width(640).height(800).url() : null

  const hasSale = !!(product.compareAtPrice && product.compareAtPrice > product.price)
  const [hovered, setHovered] = useState(false)

  // 3D tilt — mouse position relative to card
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]),  { stiffness: 300, damping: 28 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6,  6]), { stiffness: 300, damping: 28 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }

  const onMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setHovered(false)
  }

  return (
    <div
      ref={cardRef}
      className={s.cardWrapper}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={() => setHovered(true)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={s.cardInner}
      >
        <Link href={`/shop/${product.slug.current}`} className={s.card}>
          {/* Image — CSS cross-fade on hover */}
          <div className={s.imageWrap}>
            {primaryUrl && (
              <Image
                src={primaryUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={s.imgPrimary}
                priority={priority}
              />
            )}
            {secondaryUrl && (
              <Image
                src={secondaryUrl}
                alt={`${product.title} — alternate view`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={s.imgSecondary}
                aria-hidden="true"
              />
            )}

            {/* Glare sheen — CSS pseudo handles ambient; motion tracks mouse via CSS vars */}
            <div className={s.glare} aria-hidden="true" />

            {product.isNew && (
              <span className={`${s.badge} ${s.badgeNew}`}>New</span>
            )}
            {hasSale && (
              <span className={`${s.badge} ${s.badgeSale}`}>Sale</span>
            )}

            {/* Wishlist heart */}
            <motion.button
              type="button"
              className={s.wishBtn}
              aria-label="Save to wishlist"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.preventDefault()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </motion.button>

            {/* Floating quick-view strip */}
            <motion.div
              className={s.quickView}
              initial={{ y: '100%', opacity: 0 }}
              animate={hovered ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <span className={s.quickViewLabel}>Quick View</span>
            </motion.div>
          </div>

          {/* Info */}
          <div className={s.info}>
            <p className={s.productName}>{product.title}</p>
            <div className={s.priceRow}>
              <span className={s.price}>GH¢ {product.price.toLocaleString()}</span>
              {hasSale && (
                <span className={s.priceStruck}>
                  GH¢ {product.compareAtPrice!.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
