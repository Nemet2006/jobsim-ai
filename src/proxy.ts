import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { makeT } from '@/i18n/t'
import { resolveRequestLocale, withLocaleCookie } from '@/i18n/request-locale'
import { resolveUserRole } from '@/lib/platform-admin'
import { resolveNextPath } from '@/lib/next-path'

const ROLE_REDIRECTS: Record<string, string> = {
  student: '/student/dashboard',
  hr: '/hr/dashboard',
  courses: '/courses/dashboard',
  admin: '/admin/dashboard',
}

const PROTECTED_PREFIXES = ['/student', '/hr', '/courses', '/admin']
const AUTH_ROUTES = ['/login', '/register']

const PROTECTED_API_PREFIXES = [
  '/api/attempts/',
  '/api/reports/',
  '/api/groups/',
  '/api/premium/activate',
  '/api/premium/checkout',
  '/api/premium/confirm',
  '/api/analytics/summary',
  '/api/analytics/events',
  '/api/analytics/report',
]

const PUBLIC_API_PREFIXES = [
  '/api/premium/webhook',
  '/api/auth/register',
  '/api/analytics/track',
  '/api/locale',
]

/** Paths that never need an auth round-trip to Supabase. */
const AUTH_BYPASS_PREFIXES = [
  '/robots.txt',
  '/sitemap.xml',
  '/api/analytics/track',
  '/api/premium/webhook',
  '/api/locale',
]

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) =>
    c.name.includes('-auth-token') || c.name.startsWith('sb-')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { locale, missing } = resolveRequestLocale(request)
  const t = makeT(locale)
  const pass = (response: NextResponse) => withLocaleCookie(response, locale, missing)

  if (AUTH_BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '?'))) {
    return pass(NextResponse.next())
  }

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isProtectedApi =
    !isPublicApi &&
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Anonymous visitors on public marketing pages — skip Supabase getUser latency
  if (!hasAuthCookie(request) && !isProtected && !isProtectedApi && !isAuthRoute) {
    return pass(NextResponse.next())
  }

  // Anonymous hitting protected routes — redirect without network call when possible
  if (!hasAuthCookie(request) && isProtected) {
    return pass(NextResponse.redirect(new URL('/login', request.url)))
  }
  if (!hasAuthCookie(request) && isProtectedApi) {
    return pass(NextResponse.json({ error: t('errors.unauthorized') }, { status: 401 }))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedApi) {
    return pass(NextResponse.json({ error: t('errors.unauthorized') }, { status: 401 }))
  }

  if (!user && isProtected) {
    return pass(NextResponse.redirect(new URL('/login', request.url)))
  }

  if (user && (isAuthRoute || isProtected)) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = resolveUserRole(profile?.role, user.email)
    if (role) {
      if (isAuthRoute) {
        const next = resolveNextPath(request.nextUrl.searchParams.get('next'), role)
        return pass(NextResponse.redirect(
          new URL(next || ROLE_REDIRECTS[role] || '/login', request.url)
        ))
      }

      const allowedPrefix = `/${role}`
      if (!pathname.startsWith(allowedPrefix)) {
        return pass(NextResponse.redirect(
          new URL(ROLE_REDIRECTS[role], request.url)
        ))
      }
    }
  }

  return pass(supabaseResponse)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|pdf|txt|xml)$).*)',
  ],
}
