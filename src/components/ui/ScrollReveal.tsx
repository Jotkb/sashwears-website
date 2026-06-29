'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

type Variant = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn'

const VARIANTS: Record<Variant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0  },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show:   { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -32 },
    show:   { opacity: 1, x: 0   },
  },
  slideRight: {
    hidden: { opacity: 0, x: 32 },
    show:   { opacity: 1, x: 0  },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    show:   { opacity: 1, scale: 1    },
  },
}

interface Props {
  children: ReactNode
  variant?: Variant
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  threshold?: number
}

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount: threshold })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
