import { trackPageView } from '@/lib/analytics-client'

// Initial page load
try {
  trackPageView(window.location.pathname)
} catch {
  // analytics must never block hydration
}

// SPA navigations (Next.js 15.3+ official client navigation hook)
export function onRouterTransitionStart(url: string) {
  try {
    const target = new URL(url, window.location.origin)
    trackPageView(target.pathname)
  } catch {
    // ignore malformed URLs
  }
}
