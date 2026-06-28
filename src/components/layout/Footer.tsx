'use client'

import Link from 'next/link'
import { useState } from 'react'
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

export default function Footer({ whatsappNumber, instagramUrl, tiktokUrl }: Props) {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>

        {/* Top — wordmark + tagline */}
        <div className={s.top}>
          <span className={s.footerWordmark}>Sashwears</span>
          <p className={s.tagline}>Designed in Accra. Worn everywhere.</p>
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
            <ul className={`${s.linkList} ${s.followList}`}>
              {instagramUrl && (
                <li>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={s.link}>
                    Instagram — @sashwears
                  </a>
                </li>
              )}
              {tiktokUrl && (
                <li>
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className={s.link}>
                    TikTok
                  </a>
                </li>
              )}
            </ul>

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
            © {new Date().getFullYear()} Sashwears. Made in Ghana 🇬🇭
          </p>
        </div>
      </div>
    </footer>
  )
}

function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)

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

  if (submitted) {
    return (
      <p className={s.submittedNote}>You&apos;re on the list.</p>
    )
  }

  return (
    <form className={s.newsletterForm} onSubmit={handleSubmit}>
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
    </form>
  )
}
