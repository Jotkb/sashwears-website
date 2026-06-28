'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import CartDrawer from './CartDrawer'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { getItemCount, openCart } = useCartStore()
  const count = getItemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 60,
          backgroundColor: scrolled ? 'var(--color-ivory)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-line)' : 'none',
        }}
      >
        <div className="flex items-center justify-between h-full px-6 lg:px-12 max-w-[1536px] mx-auto">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden flex flex-col gap-[5px] w-5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="block h-px w-full" style={{ background: scrolled || menuOpen ? 'var(--color-ink)' : 'var(--color-ivory)' }} />
            <span className="block h-px w-full" style={{ background: scrolled || menuOpen ? 'var(--color-ink)' : 'var(--color-ivory)' }} />
            <span className="block h-px w-3/4" style={{ background: scrolled || menuOpen ? 'var(--color-ink)' : 'var(--color-ivory)' }} />
          </button>

          {/* Desktop Nav Links Left */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-label transition-opacity hover:opacity-60"
                style={{ color: scrolled ? 'var(--color-ink)' : 'var(--color-ivory)' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Wordmark */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-xl tracking-[0.12em] uppercase"
            style={{ color: scrolled ? 'var(--color-ink)' : 'var(--color-ivory)' }}
          >
            Sashwears
          </Link>

          {/* Desktop Nav Links Right + Cart */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-label transition-opacity hover:opacity-60"
                style={{ color: scrolled ? 'var(--color-ink)' : 'var(--color-ivory)' }}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={openCart}
              className="text-label transition-opacity hover:opacity-60 relative"
              style={{ color: scrolled ? 'var(--color-ink)' : 'var(--color-ivory)' }}
              aria-label="Open cart"
            >
              Bag
              {count > 0 && (
                <span
                  className="absolute -top-2 -right-3 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                  style={{ background: 'var(--color-rose-deep)', color: 'var(--color-ivory)' }}
                >
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Mobile cart icon */}
          <button
            onClick={openCart}
            className="lg:hidden text-label relative"
            style={{ color: scrolled ? 'var(--color-ink)' : 'var(--color-ivory)' }}
            aria-label="Open cart"
          >
            Bag
            {count > 0 && (
              <span
                className="absolute -top-2 -right-3 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                style={{ background: 'var(--color-rose-deep)', color: 'var(--color-ivory)' }}
              >
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="lg:hidden absolute top-[60px] left-0 right-0 py-8 px-6 flex flex-col gap-6"
            style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '1px solid var(--color-line)' }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-label"
                style={{ color: 'var(--color-ink)' }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
