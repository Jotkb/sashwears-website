'use client'

import { useEffect } from 'react'
import { IconClose } from '@/components/ui/Icons'
import s from './product.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const rows = [
  { size: 'XS', bust: '80–84', waist: '60–64', hips: '88–92' },
  { size: 'S',  bust: '84–88', waist: '64–68', hips: '92–96' },
  { size: 'M',  bust: '88–93', waist: '68–73', hips: '96–101' },
  { size: 'L',  bust: '93–98', waist: '73–78', hips: '101–106' },
  { size: 'XL', bust: '98–104', waist: '78–84', hips: '106–112' },
]

export default function SizeGuideModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={s.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
    >
      <div className={s.modalPanel} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Size Guide</h2>
          <button
            type="button"
            className={s.modalCloseBtn}
            onClick={onClose}
            aria-label="Close size guide"
          >
            <IconClose size={18} />
          </button>
        </div>

        <p className={s.modalNote}>
          All measurements in centimetres. When between sizes, size up.
        </p>

        <table className={s.sizeTable}>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Bust</th>
              <th scope="col">Waist</th>
              <th scope="col">Hips</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.size}>
                <td>{r.size}</td>
                <td>{r.bust}</td>
                <td>{r.waist}</td>
                <td>{r.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
