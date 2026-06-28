import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { featuredProductsQuery, siteSettingsQuery, categoriesQuery, lookbookEntriesQuery } from '@/sanity/queries'
import type { Product, SiteSettings, Category, LookbookEntry } from '@/types'
import { urlFor } from '@/sanity/image'
import ProductCard from '@/components/product/ProductCard'
import HeroSection from '@/components/home/HeroSection'
import { IconArrowRight } from '@/components/ui/Icons'
import s from './home.module.css'

export const revalidate = 60

export default async function HomePage() {
  const [settings, featured, categories, lookbook]: [SiteSettings, Product[], Category[], LookbookEntry[]] =
    await Promise.all([
      client.fetch(siteSettingsQuery).catch(() => ({})),
      client.fetch(featuredProductsQuery).catch(() => []),
      client.fetch(categoriesQuery).catch(() => []),
      client.fetch(lookbookEntriesQuery).catch(() => []),
    ])

  const lookbookHero = lookbook[0]

  return (
    <>
      {/* 1 — Hero */}
      <HeroSection
        videoUrl={settings.heroVideoUrl}
        heroCopy={settings.heroCopy || 'New Season.\nQuiet Confidence.'}
      />

      {/* 2 — The Edit */}
      {featured.length > 0 && (
        <section className="section-padding">
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div>
                <span className={s.sectionEyebrow}>Curated</span>
                <h2 className={s.sectionTitle}>The Edit</h2>
              </div>
              <Link href="/shop" className={s.viewAll}>
                View All <IconArrowRight size={12} />
              </Link>
            </div>

            <div className={s.editGrid}>
              {featured.map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 — Lookbook full-bleed */}
      {lookbookHero && (
        <section className={s.lookbookSection}>
          <div className={s.lookbookInner}>
            {lookbookHero.heroImage && (
              <Image
                src={urlFor(lookbookHero.heroImage).width(1920).height(823).url()}
                alt={lookbookHero.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            )}
            <div className={s.lookbookScrim} aria-hidden="true" />
            <div className={s.lookbookContent}>
              {lookbookHero.caption && (
                <p className={s.lookbookCaption}>{lookbookHero.caption}</p>
              )}
              <Link href="/lookbook" className={s.lookbookLink}>
                Explore Lookbook
                <IconArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4 — Categories */}
      {categories.length > 0 && (
        <section className="section-padding">
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div>
                <span className={s.sectionEyebrow}>Browse</span>
                <h2 className={s.sectionTitle}>Shop by Category</h2>
              </div>
            </div>

            <div className={s.categoryGrid}>
              {categories.slice(0, 4).map(cat => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${cat.slug.current}`}
                  className={s.categoryCard}
                >
                  {cat.image && (
                    <Image
                      src={urlFor(cat.image).width(600).height(800).url()}
                      alt={cat.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  <div className={s.categoryScrim} aria-hidden="true" />
                  <div className={s.categoryLabel}>
                    <span className={s.categoryName}>{cat.title}</span>
                    <span className={s.categoryArrow}>
                      Shop <IconArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Organisation structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Sashwears',
            url: process.env.NEXT_PUBLIC_SITE_URL,
            description: "Elevated women's fashion from Accra, Ghana.",
            sameAs: [settings.instagramUrl, settings.tiktokUrl].filter(Boolean),
          }),
        }}
      />
    </>
  )
}
