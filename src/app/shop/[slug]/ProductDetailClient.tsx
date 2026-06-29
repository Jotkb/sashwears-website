'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/types'
import AddToCartForm from '@/components/product/AddToCartForm'
import PortableTextRenderer from '@/components/ui/PortableTextRenderer'
import s from './product-detail.module.css'

interface Props {
  product: Product
  firstImageUrl?: string
}

const ease = [0.16, 1, 0.3, 1] as const

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
}

const DETAILS = [
  {
    label: 'Care & Composition',
    content: 'Gentle machine wash at 30°C. Do not tumble dry. Iron at low heat. Store flat or hanging.',
  },
  {
    label: 'Shipping & Returns',
    content: 'Free shipping on orders over GH¢500. Delivered within 1–5 business days in Ghana. Returns accepted within 7 days of delivery in original condition.',
  },
  {
    label: 'Sizing',
    content: 'This piece fits true to size. Our model is 5\'9″ and wears a size S. See the size guide for full measurements.',
  },
]

function AccordionRow({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        className={s.detailRow}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={s.detailLabel}>{label}</span>
        <span className={s.detailChevron} data-open={open ? 'true' : 'false'} aria-hidden="true">
          ↓
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={s.detailContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductDetailClient({ product, firstImageUrl }: Props) {
  const hasSale = !!(product.compareAtPrice && product.compareAtPrice > product.price)

  return (
    <motion.div
      className={s.info}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Category breadcrumb */}
      {product.category && (
        <motion.span className={s.categoryLabel} variants={item}>
          {product.category.title}
        </motion.span>
      )}

      {/* Title */}
      <motion.h1 className={s.productTitle} variants={item}>
        {product.title}
      </motion.h1>

      {/* Price */}
      <motion.div className={s.priceRow} variants={item}>
        <span className={s.price}>GH¢ {product.price.toLocaleString()}</span>
        {hasSale && (
          <span className={s.priceStruck}>
            GH¢ {product.compareAtPrice!.toLocaleString()}
          </span>
        )}
      </motion.div>

      {/* Description */}
      {product.description && (
        <motion.div className={s.description} variants={item}>
          <PortableTextRenderer
            value={product.description as import('@portabletext/types').PortableTextBlock[]}
          />
        </motion.div>
      )}

      {/* Add to cart */}
      <motion.div variants={item}>
        <AddToCartForm product={product} imageUrl={firstImageUrl} />
      </motion.div>

      {/* Accordion details */}
      <motion.div variants={item} className={s.detailsSection}>
        {DETAILS.map(d => (
          <AccordionRow key={d.label} label={d.label} content={d.content} />
        ))}
      </motion.div>
    </motion.div>
  )
}
