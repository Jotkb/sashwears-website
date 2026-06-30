'use client'

import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import s from './about.module.css'

/* Animated counter — counts up when in view */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref  = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const dur   = 1600
    const tick  = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

const STORY_SECTIONS = [
  {
    eyebrow: 'The Beginning',
    lead: 'Sashwears began as a quiet conviction: that Ghanaian women deserve fashion that speaks before they do.',
    body: 'Founded in Accra, Sashwears sources and curates pieces that move between the contemporary and the timeless. Each collection is an edit — deliberate, considered, uncluttered. We believe in dressing for the life you are building, not the occasion you are attending.',
  },
  {
    eyebrow: null,
    lead: null,
    body: 'Our pieces are selected with the West African climate and silhouette in mind. Breathable fabrics, generous cuts, and a palette that reads well in natural light and Accra evening. Nothing we carry is here by accident.',
  },
  {
    eyebrow: 'Made in Ghana',
    lead: null,
    body: 'Where possible, we collaborate with local artisans and Ghanaian-owned manufacturers. This is not a marketing point — it is a principle. What is made here should stay here, circulate here, and elevate here.',
  },
  {
    eyebrow: 'How We Work',
    lead: null,
    body: 'Small batches. Careful selection. No endless markdown cycles. When something sells out, it is because it was worth having. We restock thoughtfully, not reactively.',
  },
]

const VALUES = [
  { n: '01', title: 'Considered Quality', text: 'Every piece earns its place. We source for longevity, not volume — fabrics and cuts that outlast the season.' },
  { n: '02', title: 'Rooted in Accra',    text: 'Our aesthetic is shaped by the city we are from. Warm light, confident women, and a climate that demands breathable elegance.' },
  { n: '03', title: 'Slow Fashion',        text: 'Small runs. Thoughtful restocks. We would rather sell out than discount — scarcity is respect for the craft.' },
]

const STATS = [
  { to: 4, suffix: '+', label: 'Years in Accra' },
  { to: 12, suffix: '', label: 'Collections' },
  { to: 100, suffix: '%', label: 'Ghana-rooted' },
]

export default function AboutClient() {
  /* Parallax on hero image */
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])

  return (
    <>
      {/* ── Hero ── */}
      <div ref={heroRef} className={s.hero}>
        <motion.div className={s.heroImageWrap} style={{ y: heroY }}>
          <Image
            src="/images/image-28-06-26-22-08-5.jpeg"
            alt="Sashwears — editorial"
            fill
            priority
            className={s.heroImage}
            sizes="100vw"
          />
        </motion.div>
        <div className={s.heroScrim} aria-hidden="true" />
        <div className={s.heroContent}>
          <motion.span
            className={s.heroEyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            About Sashwears
          </motion.span>
          <motion.h1
            className={s.heroHeadline}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            A study in<br />restraint.
          </motion.h1>
        </div>
      </div>

      {/* ── Stats band ── */}
      <div className={s.statsRow}>
        {STATS.map((stat, i) => (
          <ScrollReveal key={stat.label} variant="fadeUp" delay={i * 0.1} threshold={0.3}>
            <div className={s.statItem}>
              <p className={s.statNumber}>
                <Counter to={stat.to} suffix={stat.suffix} />
              </p>
              <p className={s.statLabel}>{stat.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* ── Story ── */}
      <div className={s.body}>
        <div className={s.storyBlock}>
          {STORY_SECTIONS.map((sec, i) => (
            <ScrollReveal key={i} variant="fadeUp" delay={0.05} threshold={0.12}>
              <div className={s.storySection}>
                {sec.eyebrow && <span className={s.eyebrow}>{sec.eyebrow}</span>}
                {sec.lead    && <p className={s.storyLead}>{sec.lead}</p>}
                <p className={s.storyText}>{sec.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="scaleIn" delay={0.1} threshold={0.2}>
          <div className={s.closing}>
            <p className={s.closingQuote}>
              Sashwears is for women who have already decided.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* ── Values band ── */}
      <div className={s.values}>
        <div className={s.valuesInner}>
          {VALUES.map((v, i) => (
            <ScrollReveal key={v.n} variant="fadeUp" delay={i * 0.12} threshold={0.15}>
              <div className={s.valuePillar}>
                <p className={s.pillarNumber}>{v.n}</p>
                <p className={s.pillarTitle}>{v.title}</p>
                <p className={s.pillarText}>{v.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── Floating editorial image pair ── */}
      <ScrollReveal variant="fadeIn" threshold={0.1}>
        <div className={s.editorialPair}>
          <div className={s.editorialImg}>
            <Image
              src="/images/image-28-06-26-22-08-6.jpeg"
              alt="Sashwears editorial"
              fill
              className={s.editorialPhoto}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className={s.editorialImg + ' ' + s.editorialImgOffset}>
            <Image
              src="/images/image-28-06-26-22-08-2.jpeg"
              alt="Sashwears editorial"
              fill
              className={s.editorialPhoto}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </ScrollReveal>
    </>
  )
}
