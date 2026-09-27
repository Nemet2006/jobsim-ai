'use client'

import { useState } from 'react'
import { BadgePlus, Check, Copy, Send, ShieldCheck, Share2 } from 'lucide-react'
import {
  getCertificateVerifyUrl,
  getLinkedInAddToProfileUrl,
  getLinkedInShareUrl,
  type CertificateData,
} from '@/lib/certificate'
import { track } from '@/lib/analytics-client'
import { useT } from '@/i18n/I18nProvider'

interface CertificateShareProps {
  data: CertificateData
  isDark?: boolean
}

/** Share / verify actions — every shared certificate links back to a public JobSim page. */
export function CertificateShare({ data, isDark = false }: CertificateShareProps) {
  const { t } = useT()
  const [copied, setCopied] = useState(false)
  const verifyUrl = getCertificateVerifyUrl(data.attemptId)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t('public.copyLink'), verifyUrl)
    }
    track('certificate_shared', { channel: 'copy' })
  }

  const chip = isDark
    ? 'inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.06] transition-colors'
    : 'inline-flex items-center gap-1.5 rounded-md border border-paper/25 px-3 py-2 text-xs font-medium text-paper hover:bg-white/10 transition-colors'

  return (
    <div className={`mt-6 pt-5 border-t ${isDark ? 'border-white/10' : 'border-paper/15'}`}>
      <p
        className={`flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold mb-3 ${
          isDark ? 'text-gold-soft' : 'text-gold-deep'
        }`}
      >
        <Share2 size={12} aria-hidden="true" />
        {t('public.shareTitle')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={getLinkedInAddToProfileUrl(data)}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
          onClick={() => track('certificate_shared', { channel: 'linkedin_profile' })}
        >
          <BadgePlus size={13} aria-hidden="true" />
          {t('public.addLinkedIn')}
        </a>
        <a
          href={getLinkedInShareUrl(data.attemptId)}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
          onClick={() => track('certificate_shared', { channel: 'linkedin_post' })}
        >
          <Send size={13} aria-hidden="true" />
          {t('public.shareLinkedIn')}
        </a>
        <button type="button" onClick={copyLink} className={chip}>
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? t('public.copied') : t('public.copyLink')}
        </button>
        <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className={chip}>
          <ShieldCheck size={13} aria-hidden="true" />
          {t('public.openVerify')}
        </a>
      </div>
    </div>
  )
}
