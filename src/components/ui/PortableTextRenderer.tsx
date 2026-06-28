import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'

export default function PortableTextRenderer({ value }: { value: PortableTextBlock[] }) {
  return (
    <PortableText
      value={value}
      components={{
        block: {
          normal: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        },
      }}
    />
  )
}
