import type { Locale } from '@/i18n/config'
import { makeT } from '@/i18n/t'
import { getPublicSiteUrl } from '@/lib/site-url'
import { getCertificateId } from '@/lib/certificate-id'

export { getCertificateId }

export interface CertificateData {
  studentName: string
  simulationTitle: string
  roleType: string
  companyName?: string | null
  score: number
  completedAt: string
  attemptId: string
}

/** Official JobSim AI signatories shown on every certificate. */
export const CERTIFICATE_SIGNATORIES = [
  { name: 'Elvin Hacızadə', role: 'Founder' },
  { name: 'Nemət Zərbiyev', role: 'Co-Founder' },
] as const


/** Public page where anyone (e.g. an employer) can confirm the certificate is genuine. */
export function getCertificateVerifyUrl(attemptId: string): string {
  return `${getPublicSiteUrl()}/verify/${getCertificateId(attemptId)}`
}

/** LinkedIn "Add license or certification" deep link, pre-filled with this certificate. */
export function getLinkedInAddToProfileUrl(data: CertificateData): string {
  const issued = new Date(data.completedAt)
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: `${data.simulationTitle} — Job Simulation`,
    organizationName: 'JobSim AI',
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: getCertificateVerifyUrl(data.attemptId),
    certId: getCertificateId(data.attemptId),
  })
  return `https://www.linkedin.com/profile/add?${params.toString()}`
}

export function getLinkedInShareUrl(attemptId: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    getCertificateVerifyUrl(attemptId)
  )}`
}

export function getCertificateGrade(score: number, locale: Locale = 'az'): { label: string; az: string } {
  const t = makeT(locale)
  if (score >= 85) return { label: 'Distinction', az: t('certificate.distinction') }
  if (score >= 70) return { label: 'Merit', az: t('certificate.merit') }
  if (score >= 50) return { label: 'Pass', az: t('certificate.pass') }
  return { label: 'Completed', az: t('certificate.completed') }
}

const AZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
]

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Certificate date in Asia/Baku local time. */
export function formatCertificateDate(iso: string, locale: Locale = 'az'): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Baku',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(d)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  const monthIdx = Math.max(0, Number(get('month')) - 1)
  const months = locale === 'en' ? EN_MONTHS : AZ_MONTHS
  return `${get('day')} ${months[monthIdx] ?? ''} ${get('year')}`
}

export async function downloadCertificatePDF(data: CertificateData, locale: Locale = 'az'): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { registerPdfUnicodeFonts, setPdfFont } = await import('@/lib/pdf-fonts')
  const t = makeT(locale)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  await registerPdfUnicodeFonts(doc)

  const w = 297
  const h = 210
  const certId = getCertificateId(data.attemptId)
  const grade = getCertificateGrade(data.score, locale)
  const dateStr = formatCertificateDate(data.completedAt, locale)

  // Background
  doc.setFillColor(250, 245, 236)
  doc.rect(0, 0, w, h, 'F')

  // Border
  doc.setDrawColor(31, 78, 74)
  doc.setLineWidth(1.2)
  doc.rect(12, 12, w - 24, h - 24)
  doc.setDrawColor(244, 126, 71)
  doc.setLineWidth(0.4)
  doc.rect(16, 16, w - 32, h - 32)

  // Header
  doc.setTextColor(31, 78, 74)
  doc.setFontSize(22)
  setPdfFont(doc, 'bold')
  doc.text('JobSim AI', w / 2, 32, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.setTextColor(92, 92, 92)
  doc.text(t('certificate.subtitle'), w / 2, 40, { align: 'center' })

  // Title
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(28)
  setPdfFont(doc, 'bold')
  doc.text(t('certificate.title'), w / 2, 58, { align: 'center' })

  doc.setFontSize(11)
  setPdfFont(doc, 'normal')
  doc.setTextColor(92, 92, 92)
  doc.text(t('certificate.awardedTo'), w / 2, 68, { align: 'center' })

  // Student name
  doc.setTextColor(31, 78, 74)
  doc.setFontSize(24)
  setPdfFont(doc, 'bold')
  doc.text(data.studentName, w / 2, 82, { align: 'center' })

  // Simulation
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(13)
  setPdfFont(doc, 'normal')
  const simLine = data.companyName
    ? `${data.simulationTitle} — ${data.companyName}`
    : data.simulationTitle
  doc.text(t('certificate.completedFor'), w / 2, 94, { align: 'center' })

  setPdfFont(doc, 'bold')
  doc.setFontSize(15)
  doc.text(simLine, w / 2, 104, { align: 'center', maxWidth: w - 60 })

  setPdfFont(doc, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(92, 92, 92)
  doc.text(t('certificate.role', { role: data.roleType }), w / 2, 114, { align: 'center' })

  // Score badge area
  doc.setFillColor(31, 78, 74)
  doc.roundedRect(w / 2 - 35, 120, 70, 25, 4, 4, 'F')
  doc.setTextColor(250, 245, 236)
  doc.setFontSize(22)
  setPdfFont(doc, 'bold')
  doc.text(`${data.score}/100`, w / 2, 136, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.setTextColor(244, 126, 71)
  doc.text(grade.az, w / 2, 152, { align: 'center' })

  // Signatories — official JobSim AI issuance (prominent)
  const sigY = 162
  const leftX = 70
  const rightX = w - 70

  setPdfFont(doc, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(184, 134, 46)
  doc.text(t('certificate.officialSign'), w / 2, sigY - 4, { align: 'center' })

  doc.setDrawColor(31, 78, 74)
  doc.setLineWidth(0.4)
  doc.line(leftX - 32, sigY + 2, leftX + 32, sigY + 2)
  doc.line(rightX - 32, sigY + 2, rightX + 32, sigY + 2)

  setPdfFont(doc, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(31, 78, 74)
  doc.text(CERTIFICATE_SIGNATORIES[0].name, leftX, sigY + 9, { align: 'center' })
  doc.text(CERTIFICATE_SIGNATORIES[1].name, rightX, sigY + 9, { align: 'center' })

  setPdfFont(doc, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(184, 134, 46)
  doc.text(CERTIFICATE_SIGNATORIES[0].role, leftX, sigY + 15, { align: 'center' })
  doc.text(CERTIFICATE_SIGNATORIES[1].role, rightX, sigY + 15, { align: 'center' })

  // Verification QR — links to the public /verify page for this certificate
  const verifyUrl = getCertificateVerifyUrl(data.attemptId)
  try {
    const QRCode = (await import('qrcode')).default
    const qr = await QRCode.toDataURL(verifyUrl, {
      margin: 0,
      width: 240,
      color: { dark: '#1F4E4A', light: '#FAF5EC' },
    })
    const qrSize = 20
    doc.addImage(qr, 'PNG', w / 2 - qrSize / 2, sigY + 1, qrSize, qrSize)
    setPdfFont(doc, 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(92, 92, 92)
    doc.text(t('public.scanToVerify'), w / 2, sigY + qrSize + 3.5, { align: 'center' })
  } catch {
    // QR is a convenience; the printed verify URL below still works without it
  }

  // Footer
  doc.setTextColor(92, 92, 92)
  doc.setFontSize(8)
  setPdfFont(doc, 'normal')
  doc.text(t('certificate.date', { date: dateStr }), 24, h - 24)
  doc.text(t('certificate.certId', { id: certId }), 24, h - 19)
  doc.setFontSize(6.5)
  doc.text(t('public.verifyAt', { url: verifyUrl.replace(/^https?:\/\//, '') }), w / 2, h - 19, { align: 'center' })
  doc.setFontSize(8)
  doc.text(t('certificate.official'), w - 24, h - 24, { align: 'right' })
  doc.text(t('certificate.verifiedAi'), w - 24, h - 19, { align: 'right' })

  const safeName = data.studentName.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '-').slice(0, 30)
  doc.save(`JobSim-sertifikat-${safeName}.pdf`)
}
