import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
]

const PUBLIC_API_PREFIXES = [
  '/api/premium/webhook',
  '/api/auth/register',
  '/api/analytics/track',
]

export async function proxy(request: NextRequest) {
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

  const { pathname } = request.nextUrl

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isProtectedApi =
    !isPublicApi &&
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!user && isProtectedApi) {
    return NextResponse.json({ error: 'Daxil olmalısınız' }, { status: 401 })
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECTS[profile.role] || '/login', request.url)
      )
    }
  }

  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const allowedPrefix = `/${profile.role}`
      if (!pathname.startsWith(allowedPrefix)) {
        return NextResponse.redirect(
          new URL(ROLE_REDIRECTS[profile.role], request.url)
        )
      }
    }
  }

  return supabaseResponse
}

export const matcher = [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]
