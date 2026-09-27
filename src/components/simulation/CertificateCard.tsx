'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, ExternalLink } from 'lucide-react'
import {
  downloadCertificatePDF,
  getCertificateId,
  getCertificateGrade,
  formatCertificateDate,
  CERTIFICATE_SIGNATORIES,
  type CertificateData,
} from '@/lib/certificate'
import { VerificationSeal } from '@/components/ui/VerificationSeal'
import { useT } from '@/i18n/I18nProvider'
import { CertificateShare } from '@/components/simulation/CertificateShare'

interface CertificateCardProps {
  data: CertificateData
  variant?: 'light' | 'dark'
  showResultsLink?: boolean
  resultsHref?: string
  /** Off for sample/demo certificates that have no real attempt behind them. */
  shareable?: boolean
}

export function CertificateCard({
  data,
  variant = 'light',
  showResultsLink = false,
  resultsHref,
  shareable = true,
}: CertificateCardProps) {
  const { locale, t } = useT()
  const [downloading, setDownloading] = useState(false)
  const certId = getCertificateId(data.attemptId)
  const grade = getCertificateGrade(data.score, locale)
  const dateStr = formatCertificateDate(data.completedAt, locale)

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadCertificatePDF(data, locale)
    } finally {
      setDownloading(false)
    }
  }

  const isDark = variant === 'dark'

  return (
    <div
      className={
        isDark
          ? 'relative rounded-md border border-white/[0.08] bg-[#121A2B] p-6 lg:p-8 text-center shadow-xl before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-gold/70'
          : 'card-feature p-6 lg:p-8 text-paper text-center'
      }
    >
      <VerificationSeal
        score={data.score}
        label="SCORE"
        size="lg"
        variant="gold"
        className="mx-auto mb-5"
      />

      <span className={`h-eyebrow block mb-2 ${isDark ? 'text-gold-soft' : 'text-gold-deep'}`}>
        {t('sim.doneTitle')}
      </span>
      <h2 className={`font-display text-2xl lg:text-3xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-paper'}`}>
        Təbrik edirik, {data.studentName.split(' ')[0]}!
      </h2>
      <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-paper/85'}`}>
        <strong className={isDark ? 'text-white' : 'text-paper'}>{data.simulationTitle}</strong>
        {data.companyName ? ` · ${data.companyName}` : ''}
      </p>
      <p className={`text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-paper/75'}`}>
        {data.roleType} · {dateStr}
      </p>

      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gold-soft' : 'text-gold-deep'}`}>{grade.az}</p>
      <p className={`font-mono text-[10px] uppercase tracking-[0.14em] mb-6 ${isDark ? 'text-slate-400' : 'text-paper/70'}`}>
        ID: {certId}
      </p>

      {/* Official JobSim signatories — always visible under certificate */}
      <div
        className={`mb-6 rounded-lg px-4 py-5 ${
          isDark ? 'bg-white/[0.04] border border-white/10' : 'bg-black/20 border border-paper/15'
        }`}
        aria-label="JobSim AI rəsmi imza"
      >
        <p
          className={`text-[10px] uppercase tracking-[0.18em] font-semibold mb-4 ${
            isDark ? 'text-gold-soft' : 'text-gold-deep'
          }`}
        >
          JobSim AI · Rəsmi imza
        </p>
        <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
          {CERTIFICATE_SIGNATORIES.map((s) => (
            <div key={s.name} className="text-center">
              <div
                className={`mx-auto mb-2 h-px w-20 ${isDark ? 'bg-gold/50' : 'bg-gold-deep/70'}`}
                aria-hidden="true"
              />
              <p className={`text-base font-semibold leading-tight ${isDark ? 'text-white' : 'text-paper'}`}>
                {s.name}
              </p>
              <p
                className={`text-[11px] uppercase tracking-[0.14em] mt-1 font-medium ${
                  isDark ? 'text-gold-soft' : 'text-gold-deep'
                }`}
              >
                {s.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={
            isDark
              ? 'exam-btn-primary inline-flex'
              : 'inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-deep text-navy-deep font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-60'
          }
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download size={15} aria-hidden="true" />
          )}
          {t('certificate.download')}
        </button>
        {showResultsLink && resultsHref && (
          <Link
            href={resultsHref}
            className={
              isDark
                ? 'exam-btn-secondary inline-flex'
                : 'inline-flex items-center justify-center gap-2 border border-paper/25 text-paper font-medium px-6 py-2.5 rounded-md hover:bg-white/10'
            }
          >
            <ExternalLink size={14} aria-hidden="true" />
            {t('sim.seeResults')}
          </Link>
        )}
      </div>

      {shareable && <CertificateShare data={data} isDark={isDark} />}
    </div>
  )
}
