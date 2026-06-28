'use client'

import Image from 'next/image'
import Link from 'next/link'
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

  return (
    <Link href={`/shop/${product.slug.current}`} className={s.card}>
      {/* Image — CSS cross-fade on hover, no JS re-render */}
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

        {product.isNew && (
          <span className={`${s.badge} ${s.badgeNew}`}>New</span>
        )}
        {hasSale && (
          <span className={`${s.badge} ${s.badgeSale}`}>Sale</span>
        )}
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
  )
}
