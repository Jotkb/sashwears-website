import Link from 'next/link'

const shopLinks = [
  { href: '/shop?category=dresses', label: 'Dresses' },
  { href: '/shop?category=tops', label: 'Tops' },
  { href: '/shop?category=two-pieces', label: 'Two Pieces' },
  { href: '/shop?category=shoes', label: 'Shoes' },
  { href: '/shop', label: 'All Products' },
]

const helpLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/cart', label: 'Shopping Bag' },
  { href: '#size-guide', label: 'Size Guide' },
]

const aboutLinks = [
  { href: '/about', label: 'Our Story' },
  { href: '/lookbook', label: 'Lookbook' },
]

export default function Footer({ whatsappNumber, instagramUrl, tiktokUrl }: {
  whatsappNumber?: string
  instagramUrl?: string
  tiktokUrl?: string
}) {
  return (
    <footer style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-ivory)' }}>
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Shop */}
          <div>
            <p className="text-label mb-6" style={{ color: 'var(--color-blush)' }}>Shop</p>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-label mb-6" style={{ color: 'var(--color-blush)' }}>Help</p>
            <ul className="flex flex-col gap-3">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
              {whatsappNumber && (
                <li>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    WhatsApp Us
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-label mb-6" style={{ color: 'var(--color-blush)' }}>About</p>
            <ul className="flex flex-col gap-3">
              {aboutLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow + Newsletter */}
          <div>
            <p className="text-label mb-6" style={{ color: 'var(--color-blush)' }}>Follow</p>
            <ul className="flex flex-col gap-3 mb-8">
              {instagramUrl && (
                <li>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    Instagram
                  </a>
                </li>
              )}
              {tiktokUrl && (
                <li>
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    TikTok
                  </a>
                </li>
              )}
            </ul>

            {/* Newsletter */}
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(229,222,210,0.2)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            {['Visa', 'Mastercard', 'MTN MoMo', 'Telecel Cash', 'AirtelTigo'].map((m) => (
              <span
                key={m}
                className="text-[10px] px-2 py-1 border border-opacity-20"
                style={{ border: '1px solid rgba(229,222,210,0.3)', color: 'rgba(250,247,242,0.6)' }}
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(250,247,242,0.5)' }}>
            © {new Date().getFullYear()} Sashwears. Made in Ghana 🇬🇭
          </p>
        </div>
      </div>
    </footer>
  )
}

function NewsletterForm() {
  return (
    <form
      action="/api/subscribe"
      method="POST"
      className="flex gap-0"
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const email = new FormData(form).get('email') as string
        await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } })
        form.reset()
      }}
    >
      <input
        name="email"
        type="email"
        required
        placeholder="Your email"
        className="flex-1 px-3 py-2 text-sm bg-transparent border text-ivory placeholder:opacity-40 outline-none min-w-0"
        style={{ borderColor: 'rgba(229,222,210,0.3)', color: 'var(--color-ivory)' }}
      />
      <button
        type="submit"
        className="px-4 py-2 text-label transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--color-rose-deep)', color: 'var(--color-ivory)' }}
      >
        Join
      </button>
    </form>
  )
}
