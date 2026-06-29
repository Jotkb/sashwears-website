import { groq } from 'next-sanity'

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`

export const featuredProductsQuery = groq`
  *[_type == "product" && isFeatured == true][0...3] {
    _id, title, slug, price, compareAtPrice,
    "images": images[]{asset->{_id, url}, hotspot},
    category->{title, slug}
  }
`

export const allProductsQuery = groq`
  *[_type == "product"
    && (!defined($category) || category->slug.current == $category)
    && (!defined($minPrice) || price >= $minPrice)
    && (!defined($maxPrice) || price <= $maxPrice)
  ] | order(
    select($sort == "price_asc" => price, $sort == "price_desc" => -price, _createdAt) desc
  ) [$offset...$limit] {
    _id, title, slug, price, compareAtPrice, isNew,
    "images": images[]{asset->{_id, url}, hotspot},
    category->{title, slug}
  }
`

export const allProductsCountQuery = groq`
  count(*[_type == "product"
    && (!defined($category) || category->slug.current == $category)
    && (!defined($minPrice) || price >= $minPrice)
    && (!defined($maxPrice) || price <= $maxPrice)
  ])
`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id, title, slug, price, compareAtPrice, description,
    sizes, stock, isNew, isFeatured,
    "images": images[]{asset->{_id, url}, hotspot, alt},
    category->{title, slug}
  }
`

export const relatedProductsQuery = groq`
  *[_type == "product" && category->slug.current == $category && slug.current != $slug][0...4] {
    _id, title, slug, price,
    "images": images[]{asset->{_id, url}, hotspot}
  }
`

export const categoriesQuery = groq`
  *[_type == "category"] | order(order asc) {
    _id, title, slug,
    "image": image{asset->{_id, url}, hotspot}
  }
`

export const lookbookEntriesQuery = groq`
  *[_type == "lookbook"] | order(_createdAt desc) {
    _id, title, caption, layout,
    "heroImage": heroImage{asset->{_id, url}, hotspot},
    "featuredProducts": featuredProducts[]->{_id, title, slug}
  }
`

export const orderByIdQuery = groq`
  *[_type == "order" && orderNumber == $orderNumber][0] {
    _id, orderNumber, items, subtotal, shippingFee, total,
    paymentRef, paymentStatus, customer, status, createdAt
  }
`

export const shippingZonesQuery = groq`
  *[_type == "shippingZone"] | order(order asc) {
    _id, name, flatRate, estimatedDays
  }
`
