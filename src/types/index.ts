export interface SanityImage {
  asset: { _id: string; url: string }
  hotspot?: { x: number; y: number }
  alt?: string
}

export interface Category {
  _id: string
  title: string
  slug: { current: string }
  image?: SanityImage
}

export interface Product {
  _id: string
  title: string
  slug: { current: string }
  price: number
  compareAtPrice?: number
  description?: unknown[]
  images: SanityImage[]
  sizes?: string[]
  stock?: number
  isNew?: boolean
  isFeatured?: boolean
  category?: Category
}

export interface LookbookEntry {
  _id: string
  title: string
  caption?: string
  heroImage: SanityImage
  layout?: 'full' | 'half' | 'third'
  featuredProducts?: Pick<Product, '_id' | 'title' | 'slug'>[]
}

export interface ShippingZone {
  _id: string
  name: string
  flatRate: number
  estimatedDays?: string
}

export interface OrderItem {
  productId: string
  title: string
  size?: string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  paymentRef?: string
  paymentStatus: 'pending' | 'success' | 'failed'
  customer: {
    name: string
    phone: string
    email: string
    address: string
  }
  shippingZone?: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

export interface SiteSettings {
  heroVideoUrl?: string
  heroCopy?: string
  announcementText?: string
  whatsappNumber?: string
  instagramUrl?: string
  tiktokUrl?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
}

export interface CartItem {
  productId: string
  title: string
  price: number
  size?: string
  quantity: number
  imageUrl?: string
  slug: string
}
