import type { Metadata } from 'next'
import { client } from '@/sanity/client'
import { siteSettingsQuery } from '@/sanity/queries'
import type { SiteSettings } from '@/types'
import ContactForm from './ContactForm'
import ContactPageHeader from './ContactPageHeader'
import s from './contact.module.css'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Sashwears. Based in Accra, Ghana.',
}

export const revalidate = 3600

export default async function ContactPage() {
  const settings: SiteSettings = await client.fetch(siteSettingsQuery).then((r: SiteSettings | null) => r ?? {}).catch(() => ({}))

  return (
    <div className={s.page}>

      <ContactPageHeader />

      <div className={s.layout}>

        {/* Info column */}
        <div className={s.infoCol}>
          {settings.address && (
            <div className={s.infoBlock}>
              <span className={s.infoLabel}>Location</span>
              <p className={s.infoValue}>{settings.address}</p>
            </div>
          )}

          {settings.contactPhone && (
            <div className={s.infoBlock}>
              <span className={s.infoLabel}>Phone</span>
              <a href={`tel:${settings.contactPhone}`} className={s.infoLink}>
                {settings.contactPhone}
              </a>
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.infoLinkSub}
                >
                  WhatsApp Us
                </a>
              )}
            </div>
          )}

          {settings.contactEmail && (
            <div className={s.infoBlock}>
              <span className={s.infoLabel}>Email</span>
              <a href={`mailto:${settings.contactEmail}`} className={s.infoLink}>
                {settings.contactEmail}
              </a>
            </div>
          )}

          {(settings.instagramUrl || settings.tiktokUrl) && (
            <div className={s.infoBlock}>
              <span className={s.infoLabel}>Follow</span>
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className={s.infoLink}>
                  @sashwears on Instagram
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className={s.infoLink}>
                  TikTok
                </a>
              )}
            </div>
          )}
        </div>

        {/* Form column */}
        <div className={s.formCol}>
          <span className={s.formLabel}>Send a Message</span>
          <ContactForm />
        </div>

      </div>
    </div>
  )
}
