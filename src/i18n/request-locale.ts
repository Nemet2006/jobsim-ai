import { NextResponse, type NextRequest } from 'next/server'
import {
  detectLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_MAX_AGE,
  type Locale,
} from '@/i18n/config'

export function resolveRequestLocale(request: NextRequest): { locale: Locale; missing: boolean } {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value
  if (isLocale(existing)) return { locale: existing, missing: false }
  return { locale: detectLocale(request.headers.get('accept-language')), missing: true }
}

export function withLocaleCookie(response: NextResponse, locale: Locale, missing: boolean) {
  if (missing) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: LOCALE_MAX_AGE,
      sameSite: 'lax',
    })
  }
  return response
}
