/** Production fallback used when NEXT_PUBLIC_SITE_URL is not configured. */
export const DEFAULT_SITE_URL = 'https://jobsim-ai-mvpp.vercel.app'

/**
 * Public origin for links that leave the app (certificate QR codes, share links, sitemap).
 * Safe on both server and client — NEXT_PUBLIC_* is inlined at build time.
 */
export function getPublicSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return DEFAULT_SITE_URL
}
