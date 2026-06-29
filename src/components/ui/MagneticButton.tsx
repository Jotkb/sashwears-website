'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface Props {
  children: ReactNode
  className?: string
  strength?: number
  as?: 'button' | 'div' | 'span'
}

export default function MagneticButton({
  children,
  className,
  strength = 0.28,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.6 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: 'inline-flex' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
