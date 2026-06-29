'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import s from './footer.module.css'

const shopLinks = [
  { href: '/shop?category=dresses',    label: 'Dresses' },
  { href: '/shop?category=tops',       label: 'Tops' },
  { href: '/shop?category=two-pieces', label: 'Two Pieces' },
  { href: '/shop?category=shoes',      label: 'Shoes' },
  { href: '/shop',                     label: 'All Products' },
]

const helpLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/cart',    label: 'Shopping Bag' },
]

const aboutLinks = [
  { href: '/about',    label: 'Our Story' },
  { href: '/lookbook', label: 'Lookbook' },
]

const paymentMethods = ['Visa', 'Mastercard', 'MTN MoMo', 'Telecel', 'AirtelTigo']

interface Props {
  whatsappNumber?: string
  instagramUrl?: string
  tiktokUrl?: string
}

const ease = [0.16, 1, 0.3, 1] as const

export default function Footer({ whatsappNumber, instagramUrl, tiktokUrl }: Props) {
  const topRef = useRef<HTMLDivElement>(null)
  const topInView = useInView(topRef, { once: true, amount: 0.3 })

  return (
    <footer className={s.footer}>
      <div className={s.inner}>

        {/* Top — wordmark + tagline */}
        <div className={s.top} ref={topRef}>
          <motion.span
            className={s.footerWordmark}
            initial={{ opacity: 0, y: 32 }}
            animate={topInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease }}
          >
            Sashwears
          </motion.span>
          <motion.p
            className={s.tagline}
            initial={{ opacity: 0, y: 14 }}
            animate={topInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.12 }}
          >
            Designed in Accra. Worn everywhere.
          </motion.p>
        </div>

        {/* Columns */}
        <div className={s.columns}>
          {/* Shop */}
          <div>
            <span className={s.colLabel}>Shop</span>
            <ul className={s.linkList}>
              {shopLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={s.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <span className={s.colLabel}>Help</span>
            <ul className={s.linkList}>
              {helpLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={s.link}>{l.label}</Link>
                </li>
              ))}
              {whatsappNumber && (
                <li>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.link}
                  >
                    WhatsApp Us
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* About */}
          <div>
            <span className={s.colLabel}>About</span>
            <ul className={s.linkList}>
              {aboutLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={s.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow + Newsletter */}
          <div>
            <span className={s.colLabel}>Follow</span>
            <div className={s.socialRow}>
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={s.socialBtn} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={s.socialBtn} aria-label="TikTok">
                  <svg width="16" height="18" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                    <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3v178.8A162.6 162.6 0 1 1 185 188.3v89.1a74.6 74.6 0 1 0 52.2 71.2V0h88a121.2 121.2 0 0 0 1.9 22.2 122.3 122.3 0 0 0 120.9 100z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
              )}
              {!instagramUrl && !tiktokUrl && (
                <p className={s.socialPlaceholder}>@sashwears</p>
              )}
            </div>

            <span className={s.newsletterLabel}>Newsletter</span>
            <p className={s.newsletterNote}>New arrivals and quiet dispatches.</p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className={s.bottom}>
          <div className={s.paymentBadges}>
            {paymentMethods.map(m => (
              <span key={m} className={s.paymentBadge}>{m}</span>
            ))}
          </div>
          <p className={s.copyright}>
            © {new Date().getFullYear()} Sashwears. Made in Ghana.
          </p>
        </div>
      </div>
    </footer>
  )
}

function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email') as string
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null)
    setSubmitted(true)
  }

  return (
    <div ref={ref}>
      {submitted ? (
        <motion.p
          className={s.submittedNote}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          You&apos;re on the list.
        </motion.p>
      ) : (
        <motion.form
          className={s.newsletterForm}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.2 }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className={s.newsletterInput}
            aria-label="Email address for newsletter"
          />
          <button type="submit" className={s.newsletterBtn}>
            Join
          </button>
        </motion.form>
      )}
    </div>
  )
}
