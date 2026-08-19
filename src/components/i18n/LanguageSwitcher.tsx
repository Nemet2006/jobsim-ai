'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useT } from '@/i18n/I18nProvider'
import type { Locale } from '@/i18n/config'
import { LOCALES } from '@/i18n/config'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useT()
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function select(next: Locale) {
    if (next === locale || pending) return
    setPending(true)
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: next }),
      })
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-navy/12 bg-white p-0.5',
        pending && 'opacity-70',
        className,
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {LOCALES.map((code) => {
        const active = code === locale
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => select(code)}
            className={cn(
              'px-2 py-1 text-[11px] font-semibold tracking-wide rounded-[5px]',
              active ? 'bg-navy text-paper' : 'text-ink-mid hover:text-navy',
            )}
            aria-pressed={active}
          >
            {t(code === 'az' ? 'common.languageAz' : 'common.languageEn')}
          </button>
        )
      })}
    </div>
  )
}
