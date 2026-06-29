import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { featuredProductsQuery, siteSettingsQuery, categoriesQuery, lookbookEntriesQuery } from '@/sanity/queries'
import type { Product, SiteSettings, Category, LookbookEntry } from '@/types'
import { urlFor } from '@/sanity/image'
import ProductCard from '@/components/product/ProductCard'
import HeroSection from '@/components/home/HeroSection'
import HeroSlideshow from '@/components/home/HeroSlideshow'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { IconArrowRight } from '@/components/ui/Icons'
import s from './home.module.css'

export const revalidate = 60

const STATIC = {
  hero:       '/images/image-28-06-26-22-08-1.jpeg',
  hero2:      '/images/image-28-06-26-22-08-2.jpeg',
  hero3:      '/images/image-28-06-26-22-08-9.jpeg',
  lookbook:   '/images/image-28-06-26-22-08-5.jpeg',
  catDress:   '/images/image-28-06-26-22-08-11 (1).jpeg',
  catTwo:     '/images/image-28-06-26-22-08-15.jpeg',
  catEvening: '/images/image-28-06-26-22-08-7.jpeg',
  catSets:    '/images/image-28-06-26-22-08-13.jpeg',
}

type DisplayCategory = { _id: string; title: string; slug: { current: string }; staticImg?: string; image?: import('@/types').SanityImage }

const STATIC_CATEGORIES: DisplayCategory[] = [
  { _id: 'dresses',  title: 'Dresses',       slug: { current: 'dresses'    }, staticImg: STATIC.catDress   },
  { _id: 'two',      title: 'Two Pieces',    slug: { current: 'two-pieces' }, staticImg: STATIC.catTwo     },
  { _id: 'evening',  title: 'Evening',       slug: { current: 'evening'    }, staticImg: STATIC.catEvening },
  { _id: 'sets',     title: 'Sets & Coords', slug: { current: 'sets'       }, staticImg: STATIC.catSets    },
]

const SLIDESHOW_SLIDES = [
  {
    src:      STATIC.hero,
    headline: 'New Season.\nQuiet Confidence.',
    sub:      'Elevated women\'s fashion, made for the modern Ghanaian woman.',
    cta:      { label: 'Shop Now', href: '/shop' },
  },
  {
    src:      STATIC.hero2,
    headline: 'Dressed\nfor the light.',
    sub:      'Breathable fabrics and generous cuts, shaped for Accra.',
    cta:      { label: 'Explore', href: '/lookbook' },
  },
  {
    src:      STATIC.hero3,
    headline: 'Small runs.\nConsidered\nquality.',
    sub:      'We would rather sell out than discount.',
    cta:      { label: 'Our Story', href: '/about' },
  },
]

export default async function HomePage() {
  const [settings, featured, categories, lookbook]: [SiteSettings, Product[], Category[], LookbookEntry[]] =
    await Promise.all([
      client.fetch(siteSettingsQuery).then(r => r ?? {}).catch(() => ({})),
      client.fetch(featuredProductsQuery).then(r => r ?? []).catch(() => []),
      client.fetch(categoriesQuery).then(r => r ?? []).catch(() => []),
      client.fetch(lookbookEntriesQuery).then(r => r ?? []).catch(() => []),
    ])

  const lookbookHero = lookbook[0]

  const displayCategories: DisplayCategory[] = categories.length > 0
    ? categories.map(c => ({ ...c, staticImg: undefined }))
    : STATIC_CATEGORIES

  // Use slideshow when no CMS video; otherwise single hero
  const useSlideshow = !settings.heroVideoUrl

  return (
    <>
      {/* 1 — Hero / Slideshow */}
      {useSlideshow ? (
        <HeroSlideshow slides={SLIDESHOW_SLIDES} />
      ) : (
        <HeroSection
          videoUrl={settings.heroVideoUrl}
          heroImageUrl={undefined}
          heroCopy={settings.heroCopy || 'New Season.\nQuiet Confidence.'}
        />
      )}

      {/* 2 — The Edit */}
      {featured.length > 0 && (
        <section className="section-padding">
          <div className={s.section}>
            <ScrollReveal variant="fadeUp" threshold={0.1}>
              <div className={s.sectionHead}>
                <div>
                  <span className={s.sectionEyebrow}>Curated</span>
                  <h2 className={s.sectionTitle}>The Edit</h2>
                </div>
                <Link href="/shop" className={s.viewAll}>
                  View All <IconArrowRight size={12} />
                </Link>
              </div>
            </ScrollReveal>

            <div className={s.editGrid}>
              {featured.map((product, i) => (
                <ScrollReveal key={product._id} variant="fadeUp" delay={i * 0.08} threshold={0.05}>
                  <ProductCard product={product} priority={i < 3} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 — Lookbook full-bleed */}
      <ScrollReveal variant="scaleIn" threshold={0.08}>
        <section className={s.lookbookSection}>
          <div className={s.lookbookInner}>
            <Image
              src={lookbookHero?.heroImage ? urlFor(lookbookHero.heroImage).width(1920).height(823).url() : STATIC.lookbook}
              alt={lookbookHero?.title ?? 'Sashwears Lookbook'}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className={s.lookbookScrim} aria-hidden="true" />
            <div className={s.lookbookContent}>
              <ScrollReveal variant="slideLeft" delay={0.2} threshold={0.1}>
                <p className={s.lookbookCaption}>
                  {lookbookHero?.caption ?? 'Elevated style,\ntold in silhouette.'}
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeIn" delay={0.4} threshold={0.1}>
                <Link href="/lookbook" className={s.lookbookLink}>
                  Explore Lookbook
                  <IconArrowRight size={13} />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3.5 — Trust strip */}
      <div className={s.proofStrip}>
        <div className={s.proofInner}>
          {[
            { icon: '✦', title: 'Made in Ghana',        text: 'Every piece designed and finished in Accra.' },
            { icon: '✦', title: 'Free Returns',          text: 'Within 7 days of delivery, no questions asked.' },
            { icon: '✦', title: 'Secure Checkout',       text: 'Paystack-powered. Your data stays safe.' },
            { icon: '✦', title: 'WhatsApp Support',      text: 'Real humans. Quick replies.' },
          ].map((item, i) => (
            <ScrollReveal key={item.title} variant="fadeUp" delay={i * 0.07} threshold={0.1}>
              <div className={s.proofItem}>
                <span className={s.proofIcon} aria-hidden="true">{item.icon}</span>
                <span className={s.proofTitle}>{item.title}</span>
                <p className={s.proofText}>{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* 3.6 — Word marquee strip */}
      <div className={s.marqueeStrip} aria-hidden="true">
        <div className={s.marqueeTrack}>
          {[
            'Considered Quality', 'Made in Accra', 'New Season',
            'Elevated Fashion', 'Slow & Deliberate', 'Women First',
            'Considered Quality', 'Made in Accra', 'New Season',
            'Elevated Fashion', 'Slow & Deliberate', 'Women First',
          ].map((word, i) => (
            <span key={i} className={s.marqueeItem}>
              {word}
              <span className={s.marqueeSep} />
            </span>
          ))}
        </div>
      </div>

      {/* 4 — Categories */}
      <section className="section-padding">
        <div className={s.section}>
          <ScrollReveal variant="fadeUp" threshold={0.1}>
            <div className={s.sectionHead}>
              <div>
                <span className={s.sectionEyebrow}>Browse</span>
                <h2 className={s.sectionTitle}>Shop by Category</h2>
              </div>
            </div>
          </ScrollReveal>

          <div className={s.categoryGrid}>
            {displayCategories.slice(0, 4).map((cat, i) => {
              const imgSrc = cat.staticImg ?? (cat.image ? urlFor(cat.image).width(600).height(800).url() : null)
              return (
                <ScrollReveal key={cat._id} variant="scaleIn" delay={i * 0.1} threshold={0.05}>
                  <Link
                    href={`/shop?category=${cat.slug.current}`}
                    className={s.categoryCard}
                  >
                    {imgSrc && (
                      <Image
                        src={imgSrc}
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
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5 — Testimonials */}
      <div className={s.testimonialStrip}>
        <div className={s.section}>
          <ScrollReveal variant="fadeUp" threshold={0.1}>
            <div className={s.sectionHead}>
              <div>
                <span className={s.sectionEyebrow}>Worn &amp; Loved</span>
                <h2 className={s.sectionTitle}>What they say</h2>
              </div>
            </div>
          </ScrollReveal>
          <div className={s.testimonialInner}>
            {[
              { text: '“The fabric quality is unlike anything I’ve found locally. I wore it to a wedding and received compliments all evening.”', author: 'Abena K. — Accra' },
              { text: '“Sizing is true and the customer service is incredible. My order arrived beautifully packaged — felt like a gift to myself.”', author: 'Nana A. — Kumasi' },
              { text: '“I ordered two pieces and both fit like they were made for me. Sashwears understands the Ghanaian woman’s silhouette.”', author: 'Efua M. — London' },
            ].map((t, i) => (
              <ScrollReveal key={i} variant="fadeUp" delay={i * 0.1} threshold={0.08}>
                <div className={s.testimonialCard}>
                  <div className={s.testimonialStars} aria-label="5 stars">★★★★★</div>
                  <p className={s.testimonialText}>{t.text}</p>
                  <span className={s.testimonialAuthor}>{t.author}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* 6 — Editorial quote banner */}
      <ScrollReveal variant="fadeIn" threshold={0.15} duration={1.0}>
        <div className={s.quoteBanner}>
          <blockquote className={s.quoteText}>
            &ldquo;Fashion that speaks before you do.&rdquo;
          </blockquote>
          <cite className={s.quoteCite}>— Sashwears, Accra</cite>
        </div>
      </ScrollReveal>

      {/* 7 — Brand values */}
      <div className={s.valuesStrip}>
        <div className={s.valuesInner}>
          {[
            { n: '01', title: 'Considered Quality', text: 'Every piece earns its place. Sourced for longevity, not volume.' },
            { n: '02', title: 'Rooted in Accra',    text: 'Designed for the West African climate, silhouette, and light.' },
            { n: '03', title: 'Slow Fashion',        text: 'Small runs. Thoughtful restocks. We would rather sell out.' },
          ].map((v, i) => (
            <ScrollReveal key={v.n} variant="fadeUp" delay={i * 0.12} threshold={0.1}>
              <div className={s.valueItem}>
                <span className={s.valueNumber}>{v.n}</span>
                <span className={s.valueTitle}>{v.title}</span>
                <p className={s.valueText}>{v.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

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
