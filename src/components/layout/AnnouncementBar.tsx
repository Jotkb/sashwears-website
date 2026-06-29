'use client'

import { IconClose } from '@/components/ui/Icons'
import { useBar } from './BarContext'
import s from './announcement.module.css'

const DEFAULT_MESSAGE = 'Free delivery on orders over GH¢500 — Shop the new season'

interface Props {
  message?: string
}

export default function AnnouncementBar({ message }: Props) {
  const { barVisible, dismiss } = useBar()
  const text = message || DEFAULT_MESSAGE

  if (!barVisible) return null

  return (
    <div className={s.bar} role="banner">
      <div className={s.track} aria-hidden="true">
        <span className={s.message}>{text}</span>
        <span className={s.message} aria-hidden="true">{text}</span>
        <span className={s.message} aria-hidden="true">{text}</span>
      </div>
      <button
        type="button"
        className={s.close}
        onClick={dismiss}
        aria-label="Dismiss announcement"
      >
        <IconClose size={12} />
      </button>
    </div>
  )
}
