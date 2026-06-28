import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/sanity/client'
import { siteSettingsQuery } from '@/sanity/queries'
import type { SiteSettings } from '@/types'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Sashwears — Women\'s Fashion, Accra', template: '%s | Sashwears' },
  description: 'Elevated women\'s fashion from Accra. Dresses, tops, two-piece sets and shoes, made for the modern Ghanaian woman.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sashwears.com'),
  openGraph: {
    type: 'website',
    siteName: 'Sashwears',
    locale: 'en_GH',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Sashwears' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings: SiteSettings = await client.fetch(siteSettingsQuery).catch(() => ({}))

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        <Nav />
        <main className="page-enter">{children}</main>
        <Footer
          whatsappNumber={settings.whatsappNumber}
          instagramUrl={settings.instagramUrl}
          tiktokUrl={settings.tiktokUrl}
        />
        <Analytics />
        {/* Meta Pixel — fill in pixel ID to activate
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){...}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'YOUR_PIXEL_ID');
          fbq('track', 'PageView');
        `}</Script>
        */}
      </body>
    </html>
  )
}
