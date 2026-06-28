'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  videoUrl?: string
  heroCopy: string
}

export default function HeroSection({ videoUrl, heroCopy }: Props) {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex flex-col" style={{ backgroundColor: 'var(--color-ink)' }}>
      {/* Video / Fallback */}
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(135deg, var(--color-ink) 0%, var(--color-rose-deep) 50%, var(--color-ink) 100%)',
          }}
        />
      )}

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(28,26,24,0.2) 0%, transparent 40%, rgba(28,26,24,0.4) 100%)' }}
      />

      {/* Content */}
      <div className="relative flex-1 flex flex-col px-8 lg:px-16 py-20">
        {/* Bottom-left copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-auto font-display text-3xl lg:text-5xl xl:text-6xl max-w-md"
          style={{ color: 'var(--color-ivory)', lineHeight: 1.1 }}
        >
          {heroCopy}
        </motion.p>
      </div>

      {/* Bottom-right Discover link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative pb-10 pr-8 lg:pr-16 flex justify-end"
      >
        <Link
          href="/shop"
          className="text-label transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-ivory)' }}
        >
          Discover →
        </Link>
      </motion.div>
    </section>
  )
}
