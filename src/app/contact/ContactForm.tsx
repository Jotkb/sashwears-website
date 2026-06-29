'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './contact.module.css'

const schema = z.object({
  name:    z.string().min(2, 'Please enter your name'),
  email:   z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

const ease = [0.16, 1, 0.3, 1] as const

/* Floating-label field wrapper */
function FloatField({
  label,
  error,
  children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={s.floatField}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
    >
      <div className={s.floatInner}>
        {children}
        <span className={s.floatLabel}>{label}</span>
        <span className={s.floatLine} />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            className={s.fieldError}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0,  height: 'auto' }}
            exit={{   opacity: 0, y: -4,  height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      reset()
    } catch {
      setError('Something went wrong. Please try again or message us on WhatsApp.')
    }
  }

  if (submitted) {
    return (
      <motion.div
        className={s.success}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease }}
      >
        <p className={s.successTitle}>Thank you.</p>
        <p className={s.successNote}>We will be in touch shortly.</p>
      </motion.div>
    )
  }

  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
      <FloatField label="Your name" error={errors.name?.message}>
        <input
          {...register('name')}
          placeholder=" "
          className={s.floatInput}
          autoComplete="name"
        />
      </FloatField>

      <FloatField label="Email address" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          placeholder=" "
          className={s.floatInput}
          autoComplete="email"
        />
      </FloatField>

      <FloatField label="Your message" error={errors.message?.message}>
        <textarea
          {...register('message')}
          placeholder=" "
          rows={5}
          className={s.floatTextarea}
        />
      </FloatField>

      <AnimatePresence>
        {error && (
          <motion.p
            className={s.submitError}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary ${s.submitBtn}`}
        >
          {isSubmitting ? 'Sending…' : 'Send Message'}
        </button>
      </motion.div>
    </form>
  )
}
