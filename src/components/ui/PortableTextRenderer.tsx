import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import s from './portable-text.module.css'

export default function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return (
    <PortableText
      value={value}
      components={{
        block: {
          normal: ({ children }) => <p className={s.p}>{children}</p>,
        },
      }}
    />
  )
}
