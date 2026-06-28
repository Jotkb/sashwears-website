'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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
      <div className="py-8">
        <p className="font-display text-2xl mb-2">Thank you.</p>
        <p style={{ color: 'var(--color-ink-soft)' }}>We will be in touch shortly.</p>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-line)',
    outline: 'none',
    fontSize: 14,
    color: 'var(--color-ink)',
  } as React.CSSProperties

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <input
          {...register('name')}
          placeholder="Your name"
          style={inputStyle}
        />
        {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-rose-deep)' }}>{errors.name.message}</p>}
      </div>
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email address"
          style={inputStyle}
        />
        {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-rose-deep)' }}>{errors.email.message}</p>}
      </div>
      <div>
        <textarea
          {...register('message')}
          placeholder="Your message"
          rows={5}
          style={{ ...inputStyle, resize: 'none' }}
        />
        {errors.message && <p className="text-xs mt-1" style={{ color: 'var(--color-rose-deep)' }}>{errors.message.message}</p>}
      </div>

      {error && <p className="text-sm" style={{ color: 'var(--color-rose-deep)' }}>{error}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary self-start">
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
