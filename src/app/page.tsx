import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { featuredProductsQuery, siteSettingsQuery, categoriesQuery, lookbookEntriesQuery } from '@/sanity/queries'
import type { Product, SiteSettings, Category, LookbookEntry } from '@/types'
import { urlFor } from '@/sanity/image'
import ProductCard from '@/components/product/ProductCard'
import HeroSection from '@/components/home/HeroSection'

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
      {/* 1. Hero */}
      <HeroSection
        videoUrl={settings.heroVideoUrl}
        heroCopy={settings.heroCopy || 'New Season. Quiet Confidence.'}
      />

      {/* 2. The Edit */}
      {featured.length > 0 && (
        <section className="section-padding px-6 lg:px-12 max-w-[1536px] mx-auto">
          <div className="flex items-baseline justify-between mb-10 lg:mb-14">
            <h2 className="font-display text-3xl lg:text-5xl">The Edit</h2>
            <Link href="/shop" className="text-label underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {featured.map((product, i) => (
              <ProductCard key={product._id} product={product} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Lookbook Feature */}
      {lookbookHero && (
        <section className="section-padding px-6 lg:px-0">
          <div className="relative max-w-[1536px] mx-auto lg:px-12">
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              {lookbookHero.heroImage && (
                <Image
                  src={urlFor(lookbookHero.heroImage).width(1536).height(864).url()}
                  alt={lookbookHero.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16" style={{ background: 'linear-gradient(to top, rgba(28,26,24,0.6) 0%, transparent 60%)' }}>
                {lookbookHero.caption && (
                  <p className="font-display text-2xl lg:text-4xl mb-4" style={{ color: 'var(--color-ivory)' }}>
                    {lookbookHero.caption}
                  </p>
                )}
                <Link href="/lookbook" className="text-label" style={{ color: 'var(--color-blush)' }}>
                  Explore Lookbook →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Categories */}
      {categories.length > 0 && (
        <section className="section-padding px-6 lg:px-12 max-w-[1536px] mx-auto">
          <h2 className="font-display text-3xl lg:text-5xl mb-10 lg:mb-14">Shop by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat.slug.current}`}
                className="group relative overflow-hidden block"
                style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-cream)' }}
              >
                {cat.image && (
                  <Image
                    src={urlFor(cat.image).width(600).height(800).url()}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                <div
                  className="absolute inset-0 flex items-end p-5"
                  style={{ background: 'linear-gradient(to top, rgba(28,26,24,0.5) 0%, transparent 50%)' }}
                >
                  <span className="font-display text-xl" style={{ color: 'var(--color-ivory)' }}>
                    {cat.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
