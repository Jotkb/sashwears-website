'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import CartDrawer from './CartDrawer'
import { IconBag, IconMenu, IconClose, IconSun, IconMoon } from '@/components/ui/Icons'
import { useTheme } from './ThemeProvider'
import s from './nav.module.css'

const navLinks = [
  { href: '/shop',     label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
]

export default function Nav() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [cartPulse, setCartPulse] = useState(false)
  const pathname  = usePathname()
  const prevCount = useRef(0)
  const { getItemCount, openCart } = useCartStore()
  const count = getItemCount()

  const { theme, toggle } = useTheme()

  const onHeroPage = pathname === '/'
  // Hero page: text starts dark (readable before hero loads), transitions to light after delay
  const [heroReady, setHeroReady] = useState(false)
  useEffect(() => {
    if (!onHeroPage) return
    const t = setTimeout(() => setHeroReady(true), 400)
    return () => clearTimeout(t)
  }, [onHeroPage])

  const isDark = scrolled || menuOpen || !onHeroPage || !heroReady

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (count > prevCount.current) {
      setCartPulse(true)
      const t = setTimeout(() => setCartPulse(false), 600)
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <header
        className={s.header}
        data-scrolled={scrolled ? 'true' : 'false'}
        data-menu={menuOpen ? 'true' : 'false'}
        data-hero={onHeroPage && heroReady && !scrolled && !menuOpen ? 'true' : 'false'}
      >
        <div className={s.inner}>

          {/* Left slot */}
          <div className={s.slot}>
            <button
              type="button"
              className={s.menuBtn}
              data-dark={isDark ? 'true' : 'false'}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen ? 'true' : 'false'}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
            </button>

            <nav className={s.desktopNav} aria-label="Primary">
              {navLinks.slice(0, 2).map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={s.navLink}
                  data-dark={isDark ? 'true' : 'false'}
                  data-active={pathname.startsWith(l.href) ? 'true' : 'false'}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Wordmark */}
          <Link
            href="/"
            aria-label="Sashwears — home"
            className={s.wordmark}
            data-dark={isDark ? 'true' : 'false'}
          >
            Sashwears
          </Link>

          {/* Right slot */}
          <div className={s.slotRight}>
            <nav className={s.desktopNav} aria-label="Secondary">
              {navLinks.slice(2).map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={s.navLink}
                  data-dark={isDark ? 'true' : 'false'}
                  data-active={pathname.startsWith(l.href) ? 'true' : 'false'}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className={s.themeBtn}
              data-dark={isDark ? 'true' : 'false'}
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>

            <button
              type="button"
              className={s.bagBtn}
              data-dark={isDark ? 'true' : 'false'}
              onClick={openCart}
              aria-label={count > 0
                ? `Open shopping bag, ${count} item${count > 1 ? 's' : ''}`
                : 'Open shopping bag'}
            >
              <IconBag size={19} />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className={`${s.badge} ${cartPulse ? s.badgePulse : ''}`}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-nav"
          className={s.mobileMenu}
          data-open={menuOpen ? 'true' : 'false'}
          aria-hidden={menuOpen ? undefined : 'true'}
        >
          <nav className={s.mobileNav}>
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={s.mobileLink}
                data-active={pathname.startsWith(l.href) ? 'true' : 'false'}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <CartDrawer />
    </>
  )
}
