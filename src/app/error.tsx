'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useT } from '@/i18n/I18nProvider'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useT()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <AlertTriangle size={36} className="text-gold-deep mx-auto mb-5" aria-hidden="true" />
        <h1 className="font-display text-3xl font-semibold text-ink mb-3">{t('errorPage.title')}</h1>
        <p className="text-ink-mid mb-2">{t('errorPage.dek')}</p>
        {error.digest && <p className="font-mono text-xs text-ink-mute mb-6">ref: {error.digest}</p>}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button type="button" onClick={reset} className="btn-primary">
            <RotateCcw size={15} aria-hidden="true" />
            {t('errorPage.retry')}
          </button>
          <Link href="/" className="btn-secondary">{t('errorPage.home')}</Link>
        </div>
      </div>
    </main>
  )
}
