'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import s from './not-found.module.css'

const ease = [0.16, 1, 0.3, 1] as const

export default function NotFound() {
  return (
    <div className={s.page}>
      <motion.span
        className={s.code}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        404
      </motion.span>

      <motion.h1
        className={s.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.07 }}
      >
        This page doesn&apos;t exist.
      </motion.h1>

      <motion.p
        className={s.body}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.14 }}
      >
        It may have moved, or perhaps it was never here. The collection lives below.
      </motion.p>

      <motion.div
        className={s.cta}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.22 }}
      >
        <Link href="/" className="btn-primary">Back to Home</Link>
      </motion.div>
    </div>
  )
}
