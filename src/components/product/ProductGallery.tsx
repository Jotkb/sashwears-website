'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { urlFor } from '@/sanity/image'
import type { SanityImage } from '@/types'

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
    <div className="flex gap-4">
      {/* Thumbnails (desktop) */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2 w-16 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative overflow-hidden transition-opacity"
              style={{
                aspectRatio: '4/5',
                opacity: active === i ? 1 : 0.5,
                outline: active === i ? '1px solid var(--color-ink)' : 'none',
              }}
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

      {/* Main Image */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden cursor-zoom-in"
            style={{ aspectRatio: '4/5', backgroundColor: 'var(--color-cream)' }}
            onClick={() => setZoomed(true)}
          >
            <Image
              src={activeUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: active === i ? 'var(--color-ink)' : 'var(--color-line)' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(28,26,24,0.9)' }}
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-w-3xl w-full" style={{ aspectRatio: '4/5' }}>
            <Image src={activeUrl} alt={title} fill className="object-contain" />
          </div>
          <button
            className="absolute top-4 right-4 text-label"
            style={{ color: 'var(--color-ivory)' }}
            onClick={() => setZoomed(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
