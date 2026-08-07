import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobsim-ai-mvpp.vercel.app'

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
