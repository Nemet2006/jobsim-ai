import { sanitizeFilename, jsonError, requireRole } from '@/lib/api-auth'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const { user, profile } = await requireRole('hr')
    const rateLimited = await enforceRateLimit(`reports-pdf:${user.id}`, 20, 3600)
    if (rateLimited) return rateLimited

    const { companyName, stats, candidates } = await req.json()

    if (!profile.company_name || !companyName || companyName !== profile.company_name) {
      return Response.json({ error: 'Yalnız öz şirkətiniz üçün hesabat yarada bilərsiniz' }, { status: 403 })
    }

    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFillColor(10, 22, 40)
    doc.rect(0, 0, 210, 45, 'F')

    doc.setTextColor(13, 148, 136)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('JobSim AI', 20, 28)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${String(companyName).slice(0, 60)} — Ishe Qebul Hesabati`, 80, 28)

    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.text(`Tarix: ${new Date().toLocaleDateString('az-AZ')}`, 20, 37)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Umumi Statistika', 20, 58)

    const statsArr = [
      ['Umumi Cehd', stats?.totalAttempts ?? 0],
      ['Unikal Namized', stats?.totalCandidates ?? 0],
      ['Orta Bal', stats?.avgScore ?? 0],
      ['Shortlistde', stats?.shortlistCount ?? 0],
    ]

    statsArr.forEach(([label, value], i) => {
      const x = 20 + (i % 2) * 90
      const y = 68 + Math.floor(i / 2) * 18
      doc.setFillColor(22, 32, 53)
      doc.roundedRect(x, y - 6, 80, 14, 2, 2, 'F')
      doc.setTextColor(148, 163, 184)
      doc.setFontSize(8)
      doc.text(String(label), x + 4, y + 1)
      doc.setTextColor(13, 148, 136)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), x + 4, y + 8)
    })

    const tableY = 115
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.text('Namizadler', 20, tableY)

    const rows = (Array.isArray(candidates) ? candidates : []).slice(0, 20) as {
      student_name: string
      university: string | null
      score: number | null
      started_at: string
    }[]

    rows.forEach((c, i) => {
      const y = tableY + 20 + i * 10
      if (y > 280) return
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(String(c.student_name || '').slice(0, 28), 24, y + 3)
      doc.setTextColor(148, 163, 184)
      doc.text(String(c.university || '—').slice(0, 22), 80, y + 3)
      doc.text(c.score !== null ? String(c.score) : '—', 157, y + 3)
    })

    const pdfBytes = doc.output('arraybuffer')
    const filename = sanitizeFilename(companyName, 'hesabat')

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}-hesabat.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return jsonError(error, 'PDF generation failed')
  }
}
