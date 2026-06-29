import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/client'
import { productBySlugQuery, relatedProductsQuery } from '@/sanity/queries'
import type { Product } from '@/types'
import { urlFor } from '@/sanity/image'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartForm from '@/components/product/AddToCartForm'
import ProductCard from '@/components/product/ProductCard'
import ProductDetailClient from './ProductDetailClient'
import s from './product-detail.module.css'

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
    <div className={s.page}>
      {/* Product main — gallery + info */}
      <div className={s.main}>
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Info column — animated client component */}
        <ProductDetailClient
          product={product}
          firstImageUrl={firstImageUrl}
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className={s.related}>
          <div className={s.relatedHead}>
            <span className={s.relatedEyebrow}>Discover More</span>
            <h2 className={s.relatedTitle}>You May Also Like</h2>
          </div>
          <div className={s.relatedGrid}>
            {related.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Structured data */}
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
