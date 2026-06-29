'use client'

import { motion } from 'framer-motion'
import s from './contact.module.css'

const ease = [0.16, 1, 0.3, 1] as const

export default function ContactPageHeader() {
  return (
    <div className={s.pageHead}>
      <motion.span
        className={s.eyebrow}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        Say Hello
      </motion.span>
      <motion.h1
        className={s.title}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease, delay: 0.08 }}
      >
        Get in Touch
      </motion.h1>
    </div>
  )
}
