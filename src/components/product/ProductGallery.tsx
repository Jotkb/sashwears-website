'use client'

import Image from 'next/image'
import { useState } from 'react'
import { urlFor } from '@/sanity/image'
import type { SanityImage } from '@/types'
import { IconClose } from '@/components/ui/Icons'
import s from './product.module.css'

interface Props {
  images: SanityImage[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (!images?.length) return null

  const activeUrl = urlFor(images[active]).width(1000).height(1250).url()

  return (
    <div className={s.galleryWrap}>
      {/* Vertical thumbnails — desktop only */}
      {images.length > 1 && (
        <div className={s.thumbCol}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={s.thumb}
              data-active={i === active ? 'true' : 'false'}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={urlFor(img).width(120).height(150).url()}
                alt={`${title} view ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div>
        <button
          type="button"
          className={s.mainImageWrap}
          onClick={() => setZoomed(true)}
          aria-label="Zoom image"
        >
          <Image
            src={activeUrl}
            alt={title}
            fill
            className={s.mainImage}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </button>

        {/* Mobile dot navigation */}
        {images.length > 1 && (
          <div className={s.swipeDots}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={s.dot}
                data-active={i === active ? 'true' : 'false'}
                onClick={() => setActive(i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div
          className={s.zoomBackdrop}
          onClick={() => setZoomed(false)}
        >
          <div className={s.zoomInner} onClick={e => e.stopPropagation()}>
            <Image
              src={activeUrl}
              alt={title}
              fill
              className="object-contain"
              priority
            />
          </div>
          <button
            type="button"
            className={s.zoomClose}
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
          >
            <IconClose size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
