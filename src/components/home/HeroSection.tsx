'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconArrowRight } from '@/components/ui/Icons'
import s from './hero.module.css'

interface Props {
  videoUrl?: string
  heroCopy: string
}

const ease = [0.16, 1, 0.3, 1] as const

// Stagger parent: children animate in sequence
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, ease } },
}

export default function HeroSection({ videoUrl, heroCopy }: Props) {
  return (
    <section className={s.section}>
      {/* Background */}
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay muted loop playsInline
          className={s.video}
        />
      ) : (
        <div className={s.fallback} aria-hidden="true" />
      )}

      {/* Gradient overlay */}
      <div className={s.overlay} aria-hidden="true" />

      {/* Content — stagger container */}
      <motion.div
        className={s.content}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p className={s.eyebrow} variants={fadeIn}>
          New Season
        </motion.p>

        <div className={s.spacer} />

        <motion.p className={s.copy} variants={fadeUp}>
          {heroCopy}
        </motion.p>
      </motion.div>

      {/* Bottom bar — discover link + scroll line */}
      <motion.div
        className={s.bottomBar}
        variants={fadeIn}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.9, duration: 0.6, ease }}
      >
        {/* Empty left cell for flex spacing */}
        <span />

        <Link href="/shop" className={s.discoverLink}>
          Discover
          <IconArrowRight size={14} />
        </Link>
      </motion.div>

      <div className={s.scrollLine} aria-hidden="true" />
    </section>
  )
}
