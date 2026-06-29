'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconArrowRight } from '@/components/ui/Icons'
import MagneticButton from '@/components/ui/MagneticButton'
import s from './heroSlideshow.module.css'

interface Slide {
  src: string
  headline: string
  sub: string
  cta?: { label: string; href: string }
}

interface Props {
  slides: Slide[]
  autoplayMs?: number
}

export default function HeroSlideshow({ slides, autoplayMs = 5500 }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = useCallback((next: number) => {
    setDirection(next > current ? 1 : -1)
    setCurrent(next)
  }, [current])

  useEffect(() => {
    const id = setTimeout(() => {
      go((current + 1) % slides.length)
    }, autoplayMs)
    return () => clearTimeout(id)
  }, [current, go, slides.length, autoplayMs])

  const variants = {
    enter:  (d: number) => ({ opacity: 0, scale: d > 0 ? 1.06 : 0.97 }),
    center: { opacity: 1, scale: 1 },
    exit:   (d: number) => ({ opacity: 0, scale: d > 0 ? 0.97 : 1.06 }),
  }

  const textVariants = {
    hidden: { opacity: 0, y: 32 },
    show:   { opacity: 1, y: 0 },
  }

  return (
    <section className={s.section} aria-label="Hero slideshow">
      {/* Static first frame — renders server-side, always visible before JS */}
      <div className={s.staticFrame} aria-hidden="true">
        <Image
          src={slides[0].src}
          alt=""
          fill
          priority
          className={s.image}
          sizes="100vw"
        />
      </div>

      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={current}
          className={s.slide}
          custom={direction}
          variants={variants}
          initial={current === 0 ? { opacity: 1, scale: 1 } : 'enter'}
          animate="center"
          exit="exit"
          transition={{ duration: 1.2, ease: [0.45, 0, 0.15, 1] }}
        >
          <Image
            src={slides[current].src}
            alt={slides[current].headline}
            fill
            priority
            className={s.image}
            sizes="100vw"
          />
          {/* Ken Burns slow zoom on each new slide */}
          <div className={s.kenBurns} aria-hidden="true" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — always on top */}
      <div className={s.overlay} aria-hidden="true" />

      {/* Floating text — replaces on slide change */}
      <div className={s.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.35, ease: 'easeIn' } }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
            className={s.textBlock}
          >
            <motion.span
              className={s.eyebrow}
              variants={textVariants}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              New Season
            </motion.span>

            <motion.h1
              className={s.headline}
              variants={textVariants}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              {slides[current].headline}
            </motion.h1>

            <motion.p
              className={s.sub}
              variants={textVariants}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {slides[current].sub}
            </motion.p>

            {slides[current].cta && (
              <motion.div
                variants={textVariants}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <MagneticButton strength={0.22}>
                  <Link
                    href={slides[current].cta!.href}
                    className={s.cta}
                  >
                    {slides[current].cta!.label}
                    <IconArrowRight size={13} />
                  </Link>
                </MagneticButton>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dot nav */}
        <div className={s.dots} role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              className={s.dot}
              data-active={i === current ? 'true' : 'false'}
              onClick={() => go(i)}
            />
          ))}
        </div>

        {/* Progress bar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bar-${current}`}
            className={s.progressBar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: autoplayMs / 1000, ease: 'linear' }}
          />
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <div className={s.scrollHint} aria-hidden="true">
        <div className={s.scrollLine} />
      </div>
    </section>
  )
}
