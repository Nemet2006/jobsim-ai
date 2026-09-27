import type { MetadataRoute } from 'next'
import { getPublicSiteUrl } from '@/lib/site-url'

const SITE_URL = getPublicSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private portals and APIs are not for search engines
      disallow: ['/api/', '/admin/', '/student/', '/hr/', '/courses/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
