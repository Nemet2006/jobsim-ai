import { jsonError, requireRole, sanitizeFilename } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/premium'
import {
  buildAdminAnalyticsSnapshot,
  type AdminAnalyticsSnapshot,
  type RoleBreakdown,
} from '@/lib/admin-analytics'
import { trackServerEvent } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

const RANGE_LABEL: Record<string, string> = {
  '7d': 'Son 7 gun',
  '30d': 'Son 30 gun',
  '90d': 'Son 90 gun',
  all: 'Butun dovr',
}

function roleLines(prefix: string, roles: RoleBreakdown): string[] {
  return [
    `${prefix} · Telebe: ${roles.student}`,
    `${prefix} · HR: ${roles.hr}`,
    `${prefix} · Kurs/Muellim: ${roles.courses}`,
  ]
}

async function generateReportPdf(snapshot: AdminAnalyticsSnapshot): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const c = snapshot.core
  const when = new Date(snapshot.generatedAt)
  const rangeLabel = RANGE_LABEL[snapshot.range] || snapshot.range

  doc.setFillColor(22, 40, 61)
  doc.rect(0, 0, 210, 42, 'F')
  doc.setTextColor(184, 134, 46)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('JobSim AI', 16, 20)
  doc.setTextColor(246, 243, 236)
  doc.setFontSize(12)
  doc.text('Admin Core Report — LIVE', 16, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 190, 200)
  doc.text(
    `${rangeLabel}  |  Yaradildi: ${when.toLocaleString('en-GB')}  |  ${snapshot.generatedAt}`,
    16,
    38
  )

  let y = 54

  const section = (title: string) => {
    if (y > 250) {
      doc.addPage()
      y = 24
    }
    doc.setTextColor(22, 40, 61)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(title, 16, y)
    y += 8
  }

  const line = (text: string, bold = false) => {
    if (y > 280) {
      doc.addPage()
      y = 24
    }
    doc.setTextColor(21, 24, 29)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(10)
    doc.text(text, 20, y)
    y += 6
  }

  const kpiBox = (label: string, value: string | number, x: number, boxY: number) => {
    doc.setFillColor(246, 243, 236)
    doc.roundedRect(x, boxY, 42, 22, 2, 2, 'F')
    doc.setTextColor(138, 138, 138)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label, x + 3, boxY + 7)
    doc.setTextColor(22, 40, 61)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(String(value), x + 3, boxY + 17)
  }

  section('Esas core metrikalar')
  const boxY = y
  kpiBox('Sign up', c.signUps.total, 16, boxY)
  kpiBox('Sign in', c.signIns.total, 62, boxY)
  kpiBox('Sim. edenler', c.uniqueSimulators, 108, boxY)
  kpiBox('Tapshiriq', c.tasksShared.total, 154, boxY)
  y = boxY + 28
  kpiBox('Umumi klik', c.totalClicks, 16, y)
  kpiBox('Sim. bashladi', c.simulationsStarted, 62, y)
  kpiBox('Tamamlandi', c.simulationsCompleted, 108, y)
  kpiBox('Orta bal', c.avgScore ?? '-', 154, y)
  y += 32

  section('Sign up — rol uzre')
  for (const l of roleLines('Qeydiyyat', c.signUps)) line(l)
  y += 2

  section('Sign in — rol uzre')
  for (const l of roleLines('Giris', c.signIns)) line(l)
  line(`Login cehdi: ${c.loginAttempts}`)
  line(`Ugursuz login: ${c.loginFailed}`)
  y += 2

  section('Simulyasiya aktivliyi')
  line(`Unikal simulyasiya eden: ${c.uniqueSimulators}`, true)
  line(`Bashlayan cehdler: ${c.simulationsStarted}`)
  line(`Tamamlanan: ${c.simulationsCompleted}`)
  line(`Tamamlama faizi: ${c.completionRate}%`)
  line(`Orta bal: ${c.avgScore ?? '-'}`)
  y += 2

  section('Tapshiriq / simulyasiya paylasimi')
  line(`Umumi paylasilan: ${c.tasksShared.total}`, true)
  line(`Kurs tapshiriqlari (telebeye): ${c.tasksShared.courseAssignments}`)
  line(`Qrup simulyasiya tapshiriqlari: ${c.tasksShared.groupAssignments}`)
  line(`Yaradilan simulyasiyalar: ${c.tasksShared.hrSimulationsCreated}`)
  y += 2

  section('Trafik')
  line(`Umumi klik (nav): ${c.totalClicks}`, true)
  line(`Sehife baxishi: ${c.pageViews}`)
  line(`Unikal ziyaretci: ${c.uniqueVisitors}`)
  y += 4

  line('Qeyd: Bu hesabat DB-den canli hesablanib (live snapshot).')
  line(`Platform istifadecileri (umumi): ${snapshot.totals.totalUsers}`)

  return doc.output('arraybuffer')
}

export async function GET(request: Request) {
  try {
    const { user } = await requireRole('admin')
    const rateLimited = await enforceRateLimit(`admin-report:${user.id}`, 30, 3600)
    if (rateLimited) return rateLimited

    const url = new URL(request.url)
    const range = url.searchParams.get('range')

    // Always rebuild from live DB — never trust client-sent stats.
    const snapshot = await buildAdminAnalyticsSnapshot(createAdminClient(), range)

    const pdf = await generateReportPdf(snapshot)
    const stamp = new Date(snapshot.generatedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = sanitizeFilename(
      `jobsim-admin-report-${snapshot.range}-${stamp}`,
      'jobsim-admin-report'
    )

    await trackServerEvent({
      eventName: 'admin_report_downloaded',
      userId: user.id,
      role: 'admin',
      properties: {
        method: 'pdf',
        label: snapshot.range,
      },
    })

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Cache-Control': 'no-store',
        'X-Report-Generated-At': snapshot.generatedAt,
        'X-Report-Range': snapshot.range,
      },
    })
  } catch (error) {
    return jsonError(error, 'Hesabat yaradılmadı')
  }
}
