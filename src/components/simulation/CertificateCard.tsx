'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Award, Download, Loader2, ExternalLink } from 'lucide-react'
import {
  downloadCertificatePDF,
  getCertificateId,
  getCertificateGrade,
  formatCertificateDate,
  type CertificateData,
} from '@/lib/certificate'

interface CertificateCardProps {
  data: CertificateData
  variant?: 'light' | 'dark'
  showResultsLink?: boolean
  resultsHref?: string
}

export function CertificateCard({
  data,
  variant = 'light',
  showResultsLink = false,
  resultsHref,
}: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false)
  const certId = getCertificateId(data.attemptId)
  const grade = getCertificateGrade(data.score)
  const dateStr = formatCertificateDate(data.completedAt)

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadCertificatePDF(data)
    } finally {
      setDownloading(false)
    }
  }

  const isDark = variant === 'dark'

  return (
    <div
      className={
        isDark
          ? 'rounded-2xl border-2 border-teal-500/30 bg-[#112240] p-6 lg:p-8 text-center'
          : 'card-feature p-6 lg:p-8 text-cream text-center'
      }
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-coral text-white'
        }`}
      >
        <Award size={32} aria-hidden="true" />
      </div>

      <span className={`h-eyebrow block mb-2 ${isDark ? 'text-teal-300' : 'text-sun'}`}>
        Sertifikat hazırdır
      </span>
      <h2 className={`font-display text-2xl lg:text-3xl font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>
        Təbrik edirik, {data.studentName.split(' ')[0]}!
      </h2>
      <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-cream/80'}`}>
        <strong className={isDark ? 'text-white' : 'text-cream'}>{data.simulationTitle}</strong>
        {data.companyName ? ` · ${data.companyName}` : ''}
      </p>
      <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-cream/70'}`}>
        {data.roleType} · {dateStr}
      </p>

      <div
        className={`inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-5 ${
          isDark ? 'bg-teal-500/15 border border-teal-500/30' : 'bg-white/10 border border-white/15'
        }`}
      >
        <p className={`font-display text-4xl font-semibold ${isDark ? 'text-teal-300' : 'text-sun'}`}>
          {data.score}
          <span className={`text-lg ${isDark ? 'text-slate-400' : 'text-cream/60'}`}>/100</span>
        </p>
        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-teal-200' : 'text-coral'}`}>{grade.az}</p>
      </div>

      <p className={`text-[10px] uppercase tracking-wider mb-6 ${isDark ? 'text-slate-500' : 'text-cream/50'}`}>
        ID: {certId}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={
            isDark
              ? 'exam-btn-primary inline-flex'
              : 'inline-flex items-center justify-center gap-2 bg-coral hover:bg-coral-deep text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60'
          }
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          PDF yüklə
        </button>
        {showResultsLink && resultsHref && (
          <Link
            href={resultsHref}
            className={
              isDark
                ? 'exam-btn-secondary inline-flex'
                : 'inline-flex items-center justify-center gap-2 border border-cream/30 text-cream font-medium px-6 py-3 rounded-full hover:bg-white/10 transition-colors'
            }
          >
            <ExternalLink size={16} aria-hidden="true" />
            Nəticələr
          </Link>
        )}
      </div>
    </div>
  )
}
