'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { urlFor } from '@/sanity/image'
import type { Product } from '@/types'

interface Props {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: Props) {
  const [hovered, setHovered] = useState(false)

  const primaryImg = product.images?.[0]
  const secondaryImg = product.images?.[1]

  const primaryUrl = primaryImg ? urlFor(primaryImg).width(600).height(750).url() : null
  const secondaryUrl = secondaryImg ? urlFor(secondaryImg).width(600).height(750).url() : null

  return (
    <Link
      href={`/shop/${product.slug.current}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container — 4:5 ratio */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', backgroundColor: 'var(--color-cream)' }}>
        {primaryUrl && (
          <Image
            src={hovered && secondaryUrl ? secondaryUrl : primaryUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-opacity duration-300"
            priority={priority}
          />
        )}
        {product.isNew && (
          <span
            className="absolute top-3 left-3 text-label px-2 py-1"
            style={{ backgroundColor: 'var(--color-ivory)', color: 'var(--color-ink)' }}
          >
            New
          </span>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span
            className="absolute top-3 right-3 text-label px-2 py-1"
            style={{ backgroundColor: 'var(--color-rose-deep)', color: 'var(--color-ivory)' }}
          >
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-3">
        <p className="font-display text-base lg:text-lg leading-tight">{product.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            GH¢ {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm line-through" style={{ color: 'var(--color-blush)' }}>
              GH¢ {product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
