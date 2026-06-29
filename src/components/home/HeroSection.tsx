'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IconArrowRight } from '@/components/ui/Icons'
import MagneticButton from '@/components/ui/MagneticButton'
import s from './hero.module.css'

interface Props {
  videoUrl?: string
  heroCopy: string
  heroImageUrl?: string
}

const ease = [0.16, 1, 0.3, 1] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.8, ease } },
}

export default function HeroSection({ videoUrl, heroImageUrl, heroCopy }: Props) {
  const year = new Date().getFullYear()
  const sectionRef = useRef<HTMLElement>(null)

  // Parallax depth layers — driven by scroll position
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Subtle mouse-tilt on the headline
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 6
    const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 4
    setTilt({ x: nx, y: -ny })
  }
  const onMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <section
      ref={sectionRef}
      className={s.section}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ perspective: '1000px' }}
    >
      {/* ── Background — parallax layer ── */}
      <div
        className={s.bgLayer}
        style={{ transform: `translateY(${scrollY * 0.28}px)` }}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay muted loop playsInline
            className={s.video}
          />
        ) : heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            className={s.heroBgImage}
            sizes="100vw"
          />
        ) : (
          <div className={s.fallback} aria-hidden="true" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className={s.overlay} aria-hidden="true" />

      {/* ── Floating badge — top right ── */}
      <motion.div
        className={s.floatingBadge}
        initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        transition={{ delay: 1.1, duration: 0.7, ease }}
        aria-hidden="true"
      >
        <span className={s.badgeInner}>
          <span className={s.badgeLine1}>New</span>
          <span className={s.badgeLine2}>Season</span>
          <span className={s.badgeLine3}>{year}</span>
        </span>
      </motion.div>

      {/* ── Top content ── */}
      <motion.div
        className={s.content}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p className={s.eyebrow} variants={fadeIn}>
          Sashwears
          <span className={s.eyebrowYear} aria-hidden="true">— {year}</span>
        </motion.p>

        <div className={s.spacer} />
      </motion.div>

      {/* ── Bottom bar — 3D tilt on headline ── */}
      <motion.div
        className={s.bottomBar}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p
          className={s.copy}
          variants={fadeUp}
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {heroCopy}
        </motion.p>

        <motion.div className={s.ctaCluster} variants={fadeIn}>
          <div className={s.ctaRule} aria-hidden="true" />
          <MagneticButton strength={0.22}>
            <Link href="/shop" className={s.discoverLink}>
              Discover
              <IconArrowRight size={13} />
            </Link>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Floating ambient dots ── */}
      <div className={`${s.ambientDot} ${s.ambientDot1}`} aria-hidden="true" />
      <div className={`${s.ambientDot} ${s.ambientDot2}`} aria-hidden="true" />
      <div className={`${s.ambientDot} ${s.ambientDot3}`} aria-hidden="true" />

      <div className={s.scrollLine} aria-hidden="true" />
    </section>
  )
}
