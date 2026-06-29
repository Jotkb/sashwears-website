import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { lookbookEntriesQuery } from '@/sanity/queries'
import type { LookbookEntry } from '@/types'
import { urlFor } from '@/sanity/image'
import ScrollReveal from '@/components/ui/ScrollReveal'
import s from './lookbook.module.css'

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Editorial looks from Sashwears. Curated pieces, styled for the modern Ghanaian woman.',
}

export const revalidate = 60

export default async function LookbookPage() {
  const entries: LookbookEntry[] = await client.fetch(lookbookEntriesQuery)
    .then((r: LookbookEntry[] | null) => r ?? [])
    .catch(() => [])

  // Group consecutive non-full entries into rows of 2
  const blocks: Array<{ type: 'full'; entry: LookbookEntry } | { type: 'row'; entries: LookbookEntry[] }> = []
  let i = 0
  while (i < entries.length) {
    const entry = entries[i]
    const isFull = entry.layout === 'full' || !entry.layout || i === 0
    if (isFull) {
      blocks.push({ type: 'full', entry })
      i++
    } else {
      const pair = [entry]
      if (entries[i + 1] && entries[i + 1].layout !== 'full') {
        pair.push(entries[i + 1])
        i += 2
      } else {
        i++
      }
      blocks.push({ type: 'row', entries: pair })
    }
  }

  return (
    <div className={s.page}>
      <ScrollReveal variant="fadeUp" threshold={0.1}>
        <div className={s.pageHead}>
          <span className={s.eyebrow}>Editorial</span>
          <h1 className={s.title}>Lookbook</h1>
        </div>
      </ScrollReveal>

      {entries.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyLine} aria-hidden="true" />
          <p className={s.emptyTitle}>A new story is being told.</p>
          <p className={s.emptyNote}>Check back soon.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {blocks.map((block, bi) => {
            if (block.type === 'full') {
              const { entry } = block
              const imageUrl = entry.heroImage
                ? urlFor(entry.heroImage).width(1536).height(864).url()
                : null
              return (
                <ScrollReveal key={entry._id} variant="fadeIn" threshold={0.05} duration={0.9}>
                <div className={s.entryFull}>
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={entry.title}
                      fill
                      priority={bi === 0}
                      className="object-cover"
                      sizes="100vw"
                    />
                  )}
                  <div className={s.scrim} aria-hidden="true" />
                  <div className={s.overlay}>
                    {entry.caption && <p className={s.caption}>{entry.caption}</p>}
                    {entry.featuredProducts && entry.featuredProducts.length > 0 && (
                      <div className={s.pills}>
                        {entry.featuredProducts.map(p => (
                          <Link
                            key={p._id}
                            href={`/shop/${p.slug?.current}`}
                            className={s.pill}
                          >
                            {p.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </ScrollReveal>
              )
            }

            return (
              <ScrollReveal key={bi} variant="scaleIn" threshold={0.05} duration={0.8}>
              <div className={s.entryRow}>
                {block.entries.map(entry => {
                  const imageUrl = entry.heroImage
                    ? urlFor(entry.heroImage).width(760).height(1013).url()
                    : null
                  return (
                    <div key={entry._id} className={s.entryHalf}>
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={entry.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      )}
                      <div className={s.scrim} aria-hidden="true" />
                      {entry.caption && (
                        <div className={s.overlay}>
                          <p className={s.captionSmall}>{entry.caption}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
