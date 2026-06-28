import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { productBySlugQuery, relatedProductsQuery } from '@/sanity/queries'
import type { Product } from '@/types'
import { urlFor } from '@/sanity/image'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartForm from '@/components/product/AddToCartForm'
import ProductCard from '@/components/product/ProductCard'
import PortableTextRenderer from '@/components/ui/PortableTextRenderer'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product: Product = await client.fetch(productBySlugQuery, { slug }).catch(() => null)
  if (!product) return {}
  const imageUrl = product.images?.[0] ? urlFor(product.images[0]).width(1200).height(630).url() : undefined
  return {
    title: product.title,
    description: `GH¢ ${product.price.toLocaleString()} — Shop ${product.title} at Sashwears.`,
    openGraph: {
      title: product.title,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product: Product = await client.fetch(productBySlugQuery, { slug }).catch(() => null)

  if (!product) notFound()

  const related: Product[] = await client
    .fetch(relatedProductsQuery, { category: product.category?.slug.current ?? '', slug })
    .catch(() => [])

  const firstImageUrl = product.images?.[0]
    ? urlFor(product.images[0]).width(800).url()
    : undefined

  return (
    <div className="pt-[60px]">
      {/* Product Main */}
      <section className="max-w-[1536px] mx-auto px-6 lg:px-12 section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Info — sticky on desktop */}
          <div className="lg:sticky lg:top-[80px] lg:self-start">
            {product.category && (
              <p className="text-label mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                {product.category.title}
              </p>
            )}
            <h1 className="font-display text-4xl lg:text-5xl leading-tight mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-2xl">
                GH¢ {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg line-through" style={{ color: 'var(--color-blush)' }}>
                  GH¢ {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
                <PortableTextRenderer value={product.description as import('@portabletext/types').PortableTextBlock[]} />
              </div>
            )}

            {/* Add to Cart Form (client) */}
            <AddToCartForm
              product={product}
              imageUrl={firstImageUrl}
            />

            {/* Size Guide link */}
            <button
              type="button"
              data-size-guide
              className="mt-4 text-label underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
            >
              Size Guide
            </button>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section-padding px-6 lg:px-12 max-w-[1536px] mx-auto">
          <h2 className="font-display text-3xl lg:text-4xl mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: `GH¢ ${product.price}`,
            image: firstImageUrl,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'GHS',
              availability: (product.stock ?? 1) > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </div>
  )
}
