import type { MetadataRoute } from 'next'
import { getPublicSiteUrl } from '@/lib/site-url'
import { listPublicSimulationIds } from '@/lib/public-data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getPublicSiteUrl()
  const now = new Date()
  const sims = await listPublicSimulationIds()

  return [
    { url: site, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/simulations`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site}/verify`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...sims.map((s) => ({
      url: `${site}/simulations/${s.id}`,
      lastModified: new Date(s.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
