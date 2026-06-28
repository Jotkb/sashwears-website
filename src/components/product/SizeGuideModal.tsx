'use client'

import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const sizeData = [
  { size: 'XS', bust: '80-84', waist: '60-64', hips: '88-92' },
  { size: 'S',  bust: '84-88', waist: '64-68', hips: '92-96' },
  { size: 'M',  bust: '88-93', waist: '68-73', hips: '96-101' },
  { size: 'L',  bust: '93-98', waist: '73-78', hips: '101-106' },
  { size: 'XL', bust: '98-104', waist: '78-84', hips: '106-112' },
]

export default function SizeGuideModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,26,24,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg p-8"
        style={{ backgroundColor: 'var(--color-ivory)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Size Guide</h2>
          <button onClick={onClose} className="text-label opacity-60 hover:opacity-100 transition-opacity">Close</button>
        </div>

        <p className="text-xs mb-6" style={{ color: 'var(--color-ink-soft)' }}>
          All measurements in centimetres. When between sizes, size up.
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
              {['Size', 'Bust', 'Waist', 'Hips'].map((h) => (
                <th key={h} className="text-left py-2 text-label" style={{ color: 'var(--color-ink-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeData.map((row) => (
              <tr key={row.size} style={{ borderBottom: '1px solid var(--color-line)' }}>
                <td className="py-3 font-medium">{row.size}</td>
                <td className="py-3">{row.bust}</td>
                <td className="py-3">{row.waist}</td>
                <td className="py-3">{row.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
