import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import s from './about.module.css'

export const metadata: Metadata = {
  title: 'About',
  description: "The story behind Sashwears — elevated women's fashion from Accra, Ghana.",
}

export default function AboutPage() {
  return (
    <div className={s.page}>
      <AboutClient />
    </div>
  )
}
