import { productSchema } from './product'
import { categorySchema } from './category'
import { lookbookSchema } from './lookbook'
import { orderSchema } from './order'
import { shippingZoneSchema } from './shippingZone'
import { inquirySchema } from './inquiry'
import { subscriberSchema } from './subscriber'
import { siteSettingsSchema } from './siteSettings'

export const schemas = [
  productSchema,
  categorySchema,
  lookbookSchema,
  orderSchema,
  shippingZoneSchema,
  inquirySchema,
  subscriberSchema,
  siteSettingsSchema,
]
