import { registerPdfUnicodeFontsServer, setPdfFontServer } from '@/lib/pdf-fonts-server'
import type { EventsSummary } from '@/lib/admin-events-stats'
import {
  buildProofQrDataUrl,
  createEventsReportProof,
} from '@/lib/admin-report-proof'

const setPdfFont = setPdfFontServer

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
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Baku',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const day = get('day')
  const monthIdx = Math.max(0, Number(get('month')) - 1)
  const month = AZ_MONTHS[monthIdx] ?? ''
  const year = get('year')
  const hh = get('hour')
  const mm = get('minute')
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
  doc.setDrawColor(30, 122, 99)
  doc.setLineWidth(1.3)
  doc.line(cx - 4.5, cy + 0.5, cx - 1.2, cy + 3.5)
  doc.line(cx - 1.2, cy + 3.5, cx + 5.2, cy - 3.8)
}

export async function generateEventsReportPdf(
  summary: EventsSummary
): Promise<{ pdf: ArrayBuffer; reportId: string }> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  await registerPdfUnicodeFontsServer(doc)

  const proof = createEventsReportProof(summary)
  const qrDataUrl = await buildProofQrDataUrl(proof.verifyUrl)
  const reportId = proof.payload.id
  const generatedLabel = formatAzDateTime(summary.generatedAt)
  const periodLabel = summary.eventFilter
    ? `Son ${summary.days} gün · ${summary.eventFilter}`
    : `Son ${summary.days} gün`

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 16

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
    const labelLines = doc.splitTextToSize(label, pageW - marginX * 2 - 40) as string[]
    doc.text(labelLines[0] ?? label, marginX + 2, y)
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
  doc.text('Hadisələr hesabatı', marginX, 28)

  setPdfFont(doc, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 198, 208)
  doc.text(`Dövr: ${periodLabel}`, marginX, 36)
  doc.text(generatedLabel, pageW - marginX - 28, 36, { align: 'right' })
  drawVerificationSeal(doc, pageW - marginX - 10, 20, 9)

  y = 52

  // Large QR proof strip
  const qrSize = 52
  const proofH = qrSize + 8
  ensureSpace(proofH + 4)
  doc.setFillColor(238, 242, 246)
  doc.roundedRect(marginX, y, pageW - marginX * 2, proofH, 2, 2, 'F')
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(marginX + 3, y + 3, qrSize + 2, qrSize + 2, 1.5, 1.5, 'F')
  doc.addImage(qrDataUrl, 'PNG', marginX + 4, y + 4, qrSize, qrSize)

  const metaX = marginX + qrSize + 14
  const metaMidY = y + proofH / 2
  drawVerificationSeal(doc, metaX + 10, metaMidY - 6, 11)

  setPdfFont(doc, 'bold')
  doc.setFontSize(10)
  doc.setTextColor(22, 40, 61)
  doc.text(reportId, metaX + 26, metaMidY - 8)

  setPdfFont(doc, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90, 94, 102)
  doc.text(generatedLabel, metaX + 26, metaMidY)

  const fingerprint = reportId.replace(/^JSIM-EVT-/, '').replace(/^JSIM-/, '')
  doc.setFillColor(22, 40, 61)
  const barX = metaX + 26
  const barY = metaMidY + 6
  for (let i = 0; i < fingerprint.length; i++) {
    const code = fingerprint.charCodeAt(i)
    const h = 3.5 + (code % 6)
    doc.rect(barX + i * 2.4, barY + (9 - h) * 0.3, 1.6, h * 0.75, 'F')
  }

  y += proofH + 6

  sectionTitle('Ümumi')
  kvRow('Ümumi hadisə', summary.totalEvents, true)
  kvRow('Unikal session', summary.uniqueSessions)
  kvRow('Unikal istifadəçi', summary.uniqueUsers)
  y += 3

  sectionTitle('Hadisə üzrə')
  if (summary.byEvent.length === 0) {
    kvRow('—', 0)
  } else {
    for (const row of summary.byEvent) {
      kvRow(row.event_name, row.total, row === summary.byEvent[0])
    }
  }
  y += 3

  sectionTitle('Rol üzrə')
  if (summary.byRole.length === 0) {
    kvRow('—', 0)
  } else {
    for (const row of summary.byRole) {
      kvRow(row.role, row.total)
    }
  }

  drawFooter()
  return { pdf: doc.output('arraybuffer'), reportId }
}
