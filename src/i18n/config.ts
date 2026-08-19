export const LOCALES = ['az', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'az'
export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365

export function isLocale(value: unknown): value is Locale {
  return value === 'az' || value === 'en'
}

/** First matching az/en tag in Accept-Language; default az. */
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const parts = acceptLanguage
    .toLowerCase()
    .split(',')
    .map((part) => part.split(';')[0]?.trim() || '')

  for (const part of parts) {
    if (part.startsWith('az')) return 'az'
    if (part.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}
