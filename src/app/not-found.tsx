import Link from 'next/link'
import { Compass } from 'lucide-react'
import { getT } from '@/i18n/get-locale'

export default async function NotFound() {
  const { t } = await getT()
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Compass size={36} className="text-navy mx-auto mb-5" aria-hidden="true" />
        <p className="font-mono text-sm text-gold-deep mb-2">404</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-3">{t('notFound.title')}</h1>
        <p className="text-ink-mid mb-8">{t('notFound.dek')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">{t('notFound.home')}</Link>
          <Link href="/simulations" className="btn-secondary">{t('public.exploreSims')}</Link>
        </div>
      </div>
    </main>
  )
}
