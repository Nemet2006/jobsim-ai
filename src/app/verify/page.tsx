import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { PublicShell } from '@/components/layout/PublicShell'
import { getT } from '@/i18n/get-locale'
import { normalizeCertificateId } from '@/lib/public-data'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT()
  return {
    title: t('public.verifyTitle'),
    description: t('public.verifyDek'),
    alternates: { canonical: '/verify' },
  }
}

type SearchParams = Promise<{ id?: string }>

/** Lookup form for employers: paste a certificate ID, land on its verification page. */
export default async function VerifyLookupPage({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams
  const { t } = await getT()

  let invalid = false
  if (id) {
    const certId = normalizeCertificateId(id)
    if (certId) redirect(`/verify/${certId}`)
    invalid = true
  }

  return (
    <PublicShell>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-navy-wash flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={22} className="text-navy" aria-hidden="true" />
          </div>
          <span className="h-eyebrow inline-block mb-3">{t('public.verifyEyebrow')}</span>
          <h1 className="h-display text-3xl lg:text-4xl mb-3 text-balance">{t('public.verifyTitle')}</h1>
          <p className="text-ink-mid mb-8">{t('public.verifyDek')}</p>

          <form action="/verify" method="get" className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="cert-id" className="sr-only">{t('public.certId')}</label>
            <input
              id="cert-id"
              name="id"
              required
              defaultValue={id ?? ''}
              placeholder={t('public.verifyPh')}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? 'cert-id-error' : undefined}
              className="flex-1 rounded-md border border-navy/15 bg-white px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
            <button type="submit" className="btn-primary justify-center">
              {t('public.verifyButton')}
            </button>
          </form>
          {invalid && (
            <p id="cert-id-error" role="alert" className="mt-3 text-sm text-red-700">
              {t('public.verifyBadFormat')}
            </p>
          )}
        </div>
      </section>
    </PublicShell>
  )
}
