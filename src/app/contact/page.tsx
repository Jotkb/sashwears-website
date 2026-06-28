import type { Metadata } from 'next'
import { client } from '@/sanity/client'
import { siteSettingsQuery } from '@/sanity/queries'
import type { SiteSettings } from '@/types'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Sashwears. Based in Accra, Ghana.',
}

export const revalidate = 3600

export default async function ContactPage() {
  const settings: SiteSettings = await client.fetch(siteSettingsQuery).catch(() => ({}))

  return (
    <div className="pt-[60px]">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 section-padding">
        <h1 className="font-display text-4xl lg:text-6xl mb-12">Get in Touch</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Info */}
          <div className="flex flex-col gap-10">
            {settings.address && (
              <div>
                <p className="text-label mb-3" style={{ color: 'var(--color-rose-deep)' }}>Location</p>
                <p style={{ color: 'var(--color-ink-soft)', whiteSpace: 'pre-line' }}>{settings.address}</p>
              </div>
            )}

            {settings.contactPhone && (
              <div>
                <p className="text-label mb-3" style={{ color: 'var(--color-rose-deep)' }}>Phone</p>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${settings.contactPhone}`} className="hover:opacity-70 transition-opacity">
                    {settings.contactPhone}
                  </a>
                  {settings.whatsappNumber && (
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-label underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      WhatsApp Us
                    </a>
                  )}
                </div>
              </div>
            )}

            {settings.contactEmail && (
              <div>
                <p className="text-label mb-3" style={{ color: 'var(--color-rose-deep)' }}>Email</p>
                <a href={`mailto:${settings.contactEmail}`} className="hover:opacity-70 transition-opacity">
                  {settings.contactEmail}
                </a>
              </div>
            )}

            <div>
              <p className="text-label mb-3" style={{ color: 'var(--color-rose-deep)' }}>Follow</p>
              <div className="flex flex-col gap-2">
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    @sashwears on Instagram
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    TikTok
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <p className="text-label mb-6" style={{ color: 'var(--color-ink-soft)' }}>Send a Message</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
