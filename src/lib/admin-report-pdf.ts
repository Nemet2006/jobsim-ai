import { registerPdfUnicodeFontsServer, setPdfFontServer } from '@/lib/pdf-fonts-server'
import type { AdminAnalyticsSnapshot } from '@/lib/admin-analytics'
import {
  buildProofQrDataUrl,
  createReportProof,
} from '@/lib/admin-report-proof'

const setPdfFont = setPdfFontServer

const RANGE_LABEL: Record<string, string> = {
  '7d': 'Son 7 gün',
  '30d': 'Son 30 gün',
  '90d': 'Son 90 gün',
  all: 'Bütün dövr',
}

const AZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avqust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
]

function formatAzDateTime(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = AZ_MONTHS[d.getMonth()] ?? ''
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hh}:${mm}`
}

function drawVerificationSeal(
  doc: {
    setDrawColor: (...args: number[]) => void
    setFillColor: (...args: number[]) => void
    setLineWidth: (w: number) => void
    circle: (x: number, y: number, r: number, style?: string) => void
    line: (x1: number, y1: number, x2: number, y2: number) => void
  },
  cx: number,
  cy: number,
  r: number
) {
  doc.setDrawColor(30, 122, 99)
  doc.setLineWidth(1.1)
  doc.circle(cx, cy, r, 'S')
  doc.setLineWidth(0.35)
  doc.circle(cx, cy, r - 2.2, 'S')
  doc.setFillColor(238, 247, 244)
  doc.circle(cx, cy, r - 3.2, 'F')

  // Checkmark
  doc.setDrawColor(30, 122, 99)
  doc.setLineWidth(1.3)
  doc.line(cx - 4.5, cy + 0.5, cx - 1.2, cy + 3.5)
  doc.line(cx - 1.2, cy + 3.5, cx + 5.2, cy - 3.8)
}

/** Numbers-only admin report + cryptographic QR proof (no narrative). */
export async function generateAdminReportPdf(
  snapshot: AdminAnalyticsSnapshot
): Promise<{ pdf: ArrayBuffer; reportId: string }> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  await registerPdfUnicodeFontsServer(doc)

  const proof = createReportProof(snapshot)
  const qrDataUrl = await buildProofQrDataUrl(proof.verifyUrl)

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 16
  const c = snapshot.core
  const rangeLabel = RANGE_LABEL[snapshot.range] || snapshot.range
  const generatedLabel = formatAzDateTime(snapshot.generatedAt)
  const reportId = proof.payload.id

  let y = 0
  let page = 1

  const drawFooter = () => {
    doc.setDrawColor(22, 40, 61)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageH - 12, pageW - marginX, pageH - 12)
    setPdfFont(doc, 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(138, 138, 138)
    doc.text(reportId, marginX, pageH - 7)
    doc.text(`Səhifə ${page}`, pageW - marginX, pageH - 7, { align: 'right' })
  }

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageH - 18) return
    drawFooter()
    doc.addPage()
    page += 1
    y = 18
  }

  const sectionTitle = (title: string) => {
    ensureSpace(14)
    doc.setFillColor(22, 40, 61)
    doc.roundedRect(marginX, y, 3, 8, 1, 1, 'F')
    setPdfFont(doc, 'bold')
    doc.setFontSize(13)
    doc.setTextColor(22, 40, 61)
    doc.text(title, marginX + 7, y + 6)
    y += 12
  }

  const kvRow = (label: string, value: string | number, emphasize = false) => {
    ensureSpace(7)
    setPdfFont(doc, 'normal')
    doc.setFontSize(10)
    doc.setTextColor(90, 94, 102)
    doc.text(label, marginX + 2, y)
    setPdfFont(doc, emphasize ? 'bold' : 'normal')
    doc.setTextColor(21, 24, 29)
    doc.text(String(value), pageW - marginX - 2, y, { align: 'right' })
    y += 6.2
  }

  // Header
  doc.setFillColor(22, 40, 61)
  doc.rect(0, 0, pageW, 42, 'F')
  doc.setFillColor(184, 134, 46)
  doc.rect(0, 42, pageW, 1.2, 'F')

  setPdfFont(doc, 'bold')
  doc.setFontSize(22)
  doc.setTextColor(184, 134, 46)
  doc.text('JobSim AI', marginX, 18)

  setPdfFont(doc, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(246, 243, 236)
  doc.text('Admin statistika hesabatı', marginX, 28)

  setPdfFont(doc, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 198, 208)
  doc.text(`Dövr: ${rangeLabel}`, marginX, 36)
  doc.text(generatedLabel, pageW - marginX - 28, 36, { align: 'right' })

  // Header seal
  drawVerificationSeal(doc, pageW - marginX - 10, 20, 9)

  y = 52

  // Proof strip: QR + report id (machine-verifiable, no narrative)
  ensureSpace(36)
  doc.setFillColor(238, 242, 246)
  doc.roundedRect(marginX, y, pageW - marginX * 2, 34, 2, 2, 'F')

  const qrSize = 28
  doc.addImage(qrDataUrl, 'PNG', marginX + 3, y + 3, qrSize, qrSize)

  drawVerificationSeal(doc, marginX + 48, y + 17, 10)

  setPdfFont(doc, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(22, 40, 61)
  doc.text(reportId, marginX + 62, y + 12)

  setPdfFont(doc, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 94, 102)
  doc.text(proof.payload.generatedAt, marginX + 62, y + 19)

  // Hash fingerprint strip (visual, not a paragraph)
  const fingerprint = reportId.replace('JSIM-', '')
  doc.setFillColor(22, 40, 61)
  const barX = marginX + 62
  const barY = y + 24
  for (let i = 0; i < fingerprint.length; i++) {
    const code = fingerprint.charCodeAt(i)
    const h = 3 + (code % 5)
    doc.rect(barX + i * 2.2, barY + (8 - h) * 0.35, 1.4, h * 0.7, 'F')
  }

  y += 40

  sectionTitle('Platform baza')
  kvRow('Ümumi istifadəçi', snapshot.totals.totalUsers, true)
  kvRow('Tələbə', snapshot.totals.students)
  kvRow('HR', snapshot.totals.hrUsers)
  kvRow('Kurs / müəllim', snapshot.totals.coursesUsers)
  y += 3

  sectionTitle('Sign up (qeydiyyat)')
  kvRow('Cəmi', c.signUps.total, true)
  kvRow('Tələbə', c.signUps.student)
  kvRow('HR', c.signUps.hr)
  kvRow('Kurs / müəllim', c.signUps.courses)
  y += 3

  sectionTitle('Sign in (giriş)')
  kvRow('Cəmi', c.signIns.total, true)
  kvRow('Tələbə', c.signIns.student)
  kvRow('HR', c.signIns.hr)
  kvRow('Kurs / müəllim', c.signIns.courses)
  kvRow('Giriş cəhdi', c.loginAttempts)
  kvRow('Uğursuz giriş', c.loginFailed)
  y += 3

  sectionTitle('Simulyasiya')
  kvRow('Simulyasiya edənlər (unikal)', c.uniqueSimulators, true)
  kvRow('Başlayan cəhdlər', c.simulationsStarted)
  kvRow('Tamamlanan cəhdlər', c.simulationsCompleted)
  kvRow('Tamamlama faizi', `${c.completionRate}%`)
  kvRow('Orta bal', c.avgScore ?? '—')
  y += 3

  sectionTitle('Tapşırıq / simulyasiya paylaşımı')
  kvRow('Cəmi', c.tasksShared.total, true)
  kvRow('Kurs tapşırıqları', c.tasksShared.courseAssignments)
  kvRow('Qrup tapşırıqları', c.tasksShared.groupAssignments)
  kvRow('Yaradılan simulyasiyalar', c.tasksShared.hrSimulationsCreated)
  y += 3

  sectionTitle('Trafik')
  kvRow('Ümumi klik', c.totalClicks, true)
  kvRow('Səhifə baxışı', c.pageViews)
  kvRow('Unikal ziyarətçi', c.uniqueVisitors)
  if (snapshot.events) {
    kvRow('Aktiv istifadəçi', snapshot.events.active_users)
    kvRow('İnteraksiya hadisələri', snapshot.events.interaction_events)
  }

  drawFooter()
  return { pdf: doc.output('arraybuffer'), reportId }
}
