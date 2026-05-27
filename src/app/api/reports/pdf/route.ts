export async function POST(req: Request) {
  try {
    const { companyName, stats, candidates } = await req.json()

    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Header background
    doc.setFillColor(10, 22, 40)
    doc.rect(0, 0, 210, 45, 'F')

    // Logo text
    doc.setTextColor(13, 148, 136)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('JobSim AI', 20, 28)

    // Company + title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${companyName} — İşə Qəbul Hesabatı`, 80, 28)

    // Date
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.text(`Tarix: ${new Date().toLocaleDateString('az-AZ')}`, 20, 37)

    // Stats Section
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Ümumi Statistika', 20, 58)

    const statsArr = [
      ['Ümumi Cəhd', stats.totalAttempts],
      ['Unikal Namizəd', stats.totalCandidates],
      ['Orta Bal', stats.avgScore],
      ['Shortlistdə', stats.shortlistCount],
    ]

    statsArr.forEach(([label, value], i) => {
      const x = 20 + (i % 2) * 90
      const y = 68 + Math.floor(i / 2) * 18
      doc.setFillColor(22, 32, 53)
      doc.roundedRect(x, y - 6, 80, 14, 2, 2, 'F')
      doc.setTextColor(148, 163, 184)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(String(label), x + 4, y + 1)
      doc.setTextColor(13, 148, 136)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), x + 4, y + 8)
    })

    // Candidates Table
    const tableY = 115
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Namizədlər', 20, tableY)

    // Table headers
    doc.setFillColor(17, 34, 64)
    doc.rect(20, tableY + 5, 170, 10, 'F')
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Ad Soyad', 24, tableY + 12)
    doc.text('Universitet', 80, tableY + 12)
    doc.text('Bal', 155, tableY + 12)
    doc.text('Tarix', 165, tableY + 12)

    // Table rows
    const rows = (candidates as { student_name: string; university: string | null; score: number | null; started_at: string }[]).slice(0, 20)
    rows.forEach((c, i) => {
      const y = tableY + 20 + i * 10
      if (y > 280) return

      if (i % 2 === 0) {
        doc.setFillColor(22, 32, 53)
        doc.rect(20, y - 4, 170, 10, 'F')
      }

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(c.student_name.slice(0, 28), 24, y + 3)
      doc.setTextColor(148, 163, 184)
      doc.text((c.university || '—').slice(0, 22), 80, y + 3)
      if (c.score !== null) {
        doc.setTextColor(c.score >= 71 ? 34 : c.score >= 41 ? 245 : 239, c.score >= 71 ? 197 : c.score >= 41 ? 158 : 68, c.score >= 71 ? 94 : c.score >= 41 ? 11 : 68)
        doc.text(String(c.score), 157, y + 3)
      } else {
        doc.setTextColor(148, 163, 184)
        doc.text('—', 157, y + 3)
      }
      doc.setTextColor(148, 163, 184)
      doc.text(new Date(c.started_at).toLocaleDateString('az-AZ'), 165, y + 3)
    })

    // Footer
    doc.setFillColor(10, 22, 40)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(13, 148, 136)
    doc.setFontSize(7)
    doc.text('JobSim AI — jobsim.ai', 20, 292)
    doc.setTextColor(148, 163, 184)
    doc.text('Bu hesabat JobSim AI platforması tərəfindən yaradılmışdır', 80, 292)

    const pdfBytes = doc.output('arraybuffer')

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${companyName}-hesabat.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return Response.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
