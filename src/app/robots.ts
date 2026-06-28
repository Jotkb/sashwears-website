import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sashwears.com'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/studio/', '/api/', '/order/'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
