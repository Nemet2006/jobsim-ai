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

export function getCertificateId(attemptId: string): string {
  return `JSIM-${attemptId.replace(/-/g, '').slice(0, 12).toUpperCase()}`
}

export function getCertificateGrade(score: number): { label: string; az: string } {
  if (score >= 85) return { label: 'Distinction', az: 'Üstün nəticə' }
  if (score >= 70) return { label: 'Merit', az: 'Yaxşı nəticə' }
  if (score >= 50) return { label: 'Pass', az: 'Keçid' }
  return { label: 'Completed', az: 'Tamamlanmış' }
}

const AZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
]

/** Certificate date in Asia/Baku local time. */
export function formatCertificateDate(iso: string): string {
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
  return `${get('day')} ${AZ_MONTHS[monthIdx] ?? ''} ${get('year')}`
}

export async function downloadCertificatePDF(data: CertificateData): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { registerPdfUnicodeFonts, setPdfFont } = await import('@/lib/pdf-fonts')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  await registerPdfUnicodeFonts(doc)

  const w = 297
  const h = 210
  const certId = getCertificateId(data.attemptId)
  const grade = getCertificateGrade(data.score)
  const dateStr = formatCertificateDate(data.completedAt)

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
  doc.text('Job Simulation Certificate', w / 2, 40, { align: 'center' })

  // Title
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(28)
  setPdfFont(doc, 'bold')
  doc.text('Sertifikat', w / 2, 58, { align: 'center' })

  doc.setFontSize(11)
  setPdfFont(doc, 'normal')
  doc.setTextColor(92, 92, 92)
  doc.text('Bu sertifikat aşağıdakı şəxsə verilir', w / 2, 68, { align: 'center' })

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
  doc.text('uğurla tamamladığı üçün', w / 2, 94, { align: 'center' })

  setPdfFont(doc, 'bold')
  doc.setFontSize(15)
  doc.text(simLine, w / 2, 104, { align: 'center', maxWidth: w - 60 })

  setPdfFont(doc, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(92, 92, 92)
  doc.text(`Rol: ${data.roleType}`, w / 2, 114, { align: 'center' })

  // Score badge area
  doc.setFillColor(31, 78, 74)
  doc.roundedRect(w / 2 - 35, 122, 70, 28, 4, 4, 'F')
  doc.setTextColor(250, 245, 236)
  doc.setFontSize(22)
  setPdfFont(doc, 'bold')
  doc.text(`${data.score}/100`, w / 2, 140, { align: 'center' })

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
  doc.text('JobSim AI · Rəsmi imza', w / 2, sigY - 4, { align: 'center' })

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

  // Footer
  doc.setTextColor(92, 92, 92)
  doc.setFontSize(8)
  setPdfFont(doc, 'normal')
  doc.text(`Tarix: ${dateStr}`, 24, h - 18)
  doc.text(`Sertifikat ID: ${certId}`, 24, h - 12)
  doc.text('JobSim AI · rəsmi sertifikat', w - 24, h - 18, { align: 'right' })
  doc.text('AI qiymətləndirmə ilə təsdiqlənib', w - 24, h - 12, { align: 'right' })

  const safeName = data.studentName.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '-').slice(0, 30)
  doc.save(`JobSim-sertifikat-${safeName}.pdf`)
}
