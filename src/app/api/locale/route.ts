import { NextResponse } from 'next/server'
import { isLocale, LOCALE_COOKIE, LOCALE_MAX_AGE } from '@/i18n/config'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const locale = body.locale
  if (!isLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true, locale })
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_MAX_AGE,
    sameSite: 'lax',
  })
  return response
}
