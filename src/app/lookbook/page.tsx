import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { lookbookEntriesQuery } from '@/sanity/queries'
import type { LookbookEntry } from '@/types'
import { urlFor } from '@/sanity/image'

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Editorial looks from Sashwears. Curated pieces, styled for the modern Ghanaian woman.',
}

export const revalidate = 60

export default async function LookbookPage() {
  const entries: LookbookEntry[] = await client.fetch(lookbookEntriesQuery).catch(() => [])

  return (
    <div className="pt-[60px]">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 section-padding">
        <h1 className="font-display text-4xl lg:text-6xl mb-12 lg:mb-16">Lookbook</h1>

        {entries.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <p className="font-display text-2xl" style={{ color: 'var(--color-ink-soft)' }}>
              A new story is being told.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((entry, i) => {
              const isFullWidth = entry.layout === 'full' || !entry.layout || i === 0
              const isHalf = entry.layout === 'half'
              const isThird = entry.layout === 'third'

              const imageUrl = entry.heroImage
                ? urlFor(entry.heroImage)
                    .width(isFullWidth ? 1536 : isHalf ? 760 : 500)
                    .url()
                : null

              if (isFullWidth) {
                return (
                  <div key={entry._id} className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {imageUrl && (
                      <Image src={imageUrl} alt={entry.title} fill className="object-cover" priority={i === 0} sizes="100vw" />
                    )}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16"
                      style={{ background: 'linear-gradient(to top, rgba(28,26,24,0.6) 0%, transparent 50%)' }}
                    >
                      {entry.caption && (
                        <p className="font-display text-2xl lg:text-4xl mb-4" style={{ color: 'var(--color-ivory)' }}>
                          {entry.caption}
                        </p>
                      )}
                      {entry.featuredProducts && entry.featuredProducts.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {entry.featuredProducts.map((p) => (
                            <Link
                              key={p._id}
                              href={`/shop/${p.slug.current}`}
                              className="text-label px-3 py-1.5 transition-opacity hover:opacity-80"
                              style={{ backgroundColor: 'var(--color-ivory)', color: 'var(--color-ink)' }}
                            >
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={entry._id} className={`relative overflow-hidden ${isHalf ? 'lg:w-1/2' : 'lg:w-1/3'}`} style={{ aspectRatio: '3/4' }}>
                  {imageUrl && (
                    <Image src={imageUrl} alt={entry.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  )}
                  {entry.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(28,26,24,0.6), transparent)' }}>
                      <p className="font-display text-lg" style={{ color: 'var(--color-ivory)' }}>{entry.caption}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
