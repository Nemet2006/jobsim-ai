import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, type Locale, LOCALE_COOKIE } from './config'
import { makeT } from './t'
import type { TFunction } from './translate'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function getT(): Promise<{ locale: Locale; t: TFunction }> {
  const locale = await getLocale()
  return { locale, t: makeT(locale) }
}
