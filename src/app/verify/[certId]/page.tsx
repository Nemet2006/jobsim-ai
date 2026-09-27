import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, SearchX } from 'lucide-react'
import { PublicShell } from '@/components/layout/PublicShell'
import { VerificationSeal } from '@/components/ui/VerificationSeal'
import { getT } from '@/i18n/get-locale'
import { lookupCertificate, normalizeCertificateId } from '@/lib/public-data'
import { formatCertificateDate, getCertificateGrade } from '@/lib/certificate'

type Params = Promise<{ certId: string }>

async function load(rawId: string) {
  const { locale, t } = await getT()
  const certId = normalizeCertificateId(decodeURIComponent(rawId))
  const cert = certId ? await lookupCertificate(certId, locale) : null
  return { locale, t, certId, cert }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { certId } = await params
  const { t, cert } = await load(certId)
  // Individual certificates are shareable but should not be indexed by search engines.
  const robots = { index: false, follow: true }
  if (!cert) return { title: t('public.notVerified'), robots }
  const title = `${cert.studentName} — ${cert.simulationTitle}`
  const description = `${t('public.verifiedBadge')} · ${t('public.score')}: ${cert.score}/100 · JobSim AI`
  return {
    title,
    description,
    robots,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function VerifyCertificatePage({ params }: { params: Params }) {
  const { certId: rawId } = await params
  const { locale, t, certId, cert } = await load(rawId)

  if (!cert) {
    return (
      <PublicShell>
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-24">
          <div className="max-w-xl mx-auto text-center card-dossier p-8">
            <SearchX size={32} className="text-ink-mute mx-auto mb-4" aria-hidden="true" />
            <h1 className="font-display text-2xl font-semibold text-ink mb-2">{t('public.notVerified')}</h1>
            <p className="text-ink-mid mb-2">{t('public.notVerifiedDek')}</p>
            <p className="font-mono text-xs text-ink-mute mb-6 break-all">{certId || decodeURIComponent(rawId)}</p>
            <Link href="/verify" className="btn-secondary inline-flex">{t('public.verifyButton')}</Link>
          </div>
        </section>
      </PublicShell>
    )
  }

  const grade = getCertificateGrade(cert.score, locale)
  const rows = [
    { k: t('public.holder'), v: cert.studentName },
    { k: t('public.simulation'), v: cert.companyName ? `${cert.simulationTitle} — ${cert.companyName}` : cert.simulationTitle },
    { k: t('common.role'), v: cert.roleType },
    { k: t('public.score'), v: `${cert.score}/100` },
    { k: t('public.grade'), v: grade.az },
    { k: t('public.issued'), v: formatCertificateDate(cert.completedAt, locale) },
    { k: t('public.certId'), v: certId },
  ]

  return (
    <PublicShell>
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <article className="card-dossier p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-verdigris/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-verdigris mb-3">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {t('public.verifiedBadge')}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight">{cert.studentName}</h1>
                <p className="text-ink-mid mt-1">{cert.simulationTitle}</p>
              </div>
              <VerificationSeal score={cert.score} label="SCORE" size="md" variant="gold" className="shrink-0" />
            </div>

            <dl className="divide-y divide-navy/8 border-y border-navy/8 mb-5">
              {rows.map((row) => (
                <div key={row.k} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-ink-mute shrink-0">{row.k}</dt>
                  <dd className="font-medium text-ink text-right break-words min-w-0">{row.v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-ink-mute">{t('public.verifiedDek')}</p>
          </article>

          <div className="mt-8 rounded-2xl bg-navy text-paper p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-paper mb-1">{t('public.ctaTitle')}</h2>
              <p className="text-sm text-paper/80">{t('public.ctaDek')}</p>
            </div>
            <Link
              href={cert.simulationPublished ? `/simulations/${cert.simulationId}` : '/simulations'}
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-deep text-navy-deep font-semibold px-5 py-2.5 rounded-md transition-colors shrink-0"
            >
              {t('public.ctaButton')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
