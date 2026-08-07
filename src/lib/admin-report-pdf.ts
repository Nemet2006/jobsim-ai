import { registerPdfUnicodeFontsServer, setPdfFontServer } from '@/lib/pdf-fonts-server'
import type { AdminAnalyticsSnapshot, RoleBreakdown } from '@/lib/admin-analytics'

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

function pct(part: number, whole: number): string {
  if (!whole) return '0%'
  return `${Math.round((part / whole) * 100)}%`
}

function buildOverviewNarrative(snapshot: AdminAnalyticsSnapshot): string {
  const c = snapshot.core
  const range = RANGE_LABEL[snapshot.range] || snapshot.range
  const loginSuccessRate =
    c.loginAttempts > 0 ? pct(c.signIns.total, c.loginAttempts) : '—'

  return (
    `Bu hesabat JobSim AI platformasının ${range.toLowerCase()} üzrə canlı statistikalarını əks etdirir. ` +
    `Seçilmiş dövrdə ${c.signUps.total} yeni qeydiyyat və ${c.signIns.total} uğurlu giriş qeydə alınıb` +
    (c.loginAttempts > 0 ? ` (giriş uğur faizi: ${loginSuccessRate})` : '') +
    `. ` +
    `Simulyasiya aktivliyində ${c.uniqueSimulators} unikal iştirakçı ${c.simulationsStarted} cəhd başladılıb, ` +
    `onlardan ${c.simulationsCompleted} tamamlanıb (tamamlama: ${c.completionRate}%). ` +
    `Tapşırıq və simulyasiya paylaşımı cəmi ${c.tasksShared.total} ədəd təşkil edir. ` +
    `Platformada ${c.pageViews} səhifə baxışı və ${c.totalClicks} naviqasiya klikı müşahidə olunub. ` +
    `Hazırda bazada ümumilikdə ${snapshot.totals.totalUsers} istifadəçi var ` +
    `(tələbə: ${snapshot.totals.students}, HR: ${snapshot.totals.hrUsers}, kurs: ${snapshot.totals.coursesUsers}).`
  )
}

export async function generateAdminReportPdf(
  snapshot: AdminAnalyticsSnapshot
): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  await registerPdfUnicodeFontsServer(doc)

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 16
  const contentW = pageW - marginX * 2
  const c = snapshot.core
  const rangeLabel = RANGE_LABEL[snapshot.range] || snapshot.range
  const generatedLabel = formatAzDateTime(snapshot.generatedAt)

  let y = 0
  let page = 1

  const drawFooter = () => {
    doc.setDrawColor(22, 40, 61)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageH - 12, pageW - marginX, pageH - 12)
    setPdfFont(doc, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(138, 138, 138)
    doc.text('JobSim AI · Admin canlı hesabat', marginX, pageH - 7)
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

  const paragraph = (text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number] }) => {
    setPdfFont(doc, opts?.bold ? 'bold' : 'normal')
    doc.setFontSize(opts?.size ?? 10)
    doc.setTextColor(...(opts?.color ?? [21, 24, 29]))
    const lines = doc.splitTextToSize(text, contentW) as string[]
    for (const line of lines) {
      ensureSpace(6)
      doc.text(line, marginX, y)
      y += 5.2
    }
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

  const roleTable = (title: string, roles: RoleBreakdown) => {
    sectionTitle(title)
    const rows: [string, number][] = [
      ['Tələbə', roles.student],
      ['HR', roles.hr],
      ['Kurs / müəllim', roles.courses],
    ]
    if (roles.admin > 0) rows.push(['Admin', roles.admin])
    if (roles.other > 0) rows.push(['Digər', roles.other])
    rows.push(['Cəmi', roles.total])

    for (const [label, value] of rows) {
      const isTotal = label === 'Cəmi'
      ensureSpace(8)
      if (isTotal) {
        doc.setFillColor(238, 242, 246)
        doc.roundedRect(marginX, y - 4, contentW, 8, 1, 1, 'F')
      }
      kvRow(label, value, isTotal)
    }
    y += 2
  }

  const kpiGrid = (
    items: { label: string; value: string | number }[],
    cols = 4
  ) => {
    const gap = 3
    const boxW = (contentW - gap * (cols - 1)) / cols
    const boxH = 22
    const rows = Math.ceil(items.length / cols)
    ensureSpace(rows * (boxH + gap) + 2)

    items.forEach((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = marginX + col * (boxW + gap)
      const boxY = y + row * (boxH + gap)

      doc.setFillColor(246, 243, 236)
      doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'F')
      doc.setDrawColor(220, 214, 200)
      doc.setLineWidth(0.2)
      doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'S')

      setPdfFont(doc, 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(110, 114, 120)
      const labelLines = doc.splitTextToSize(item.label, boxW - 6) as string[]
      doc.text(labelLines[0] ?? '', x + 3, boxY + 7)

      setPdfFont(doc, 'bold')
      doc.setFontSize(14)
      doc.setTextColor(22, 40, 61)
      doc.text(String(item.value), x + 3, boxY + 17)
    })

    y += rows * (boxH + gap) + 4
  }

  // ── Cover / header ──────────────────────────────────────────
  doc.setFillColor(22, 40, 61)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFillColor(184, 134, 46)
  doc.rect(0, 48, pageW, 1.2, 'F')

  setPdfFont(doc, 'bold')
  doc.setFontSize(22)
  doc.setTextColor(184, 134, 46)
  doc.text('JobSim AI', marginX, 18)

  setPdfFont(doc, 'bold')
  doc.setFontSize(14)
  doc.setTextColor(246, 243, 236)
  doc.text('Admin platforma hesabatı', marginX, 28)

  setPdfFont(doc, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(190, 198, 208)
  doc.text(`Dövr: ${rangeLabel}`, marginX, 37)
  doc.text(`Yaradılıb: ${generatedLabel}`, marginX, 43)
  doc.text('CANLI SNAPSHOT', pageW - marginX, 43, { align: 'right' })

  y = 58

  // ── 1. Ümumi haqqında ───────────────────────────────────────
  sectionTitle('1. Ümumi haqqında')
  paragraph(
    'JobSim AI — tələbə, HR və təhsil müəssisələri üçün real iş simulyasiyaları platformasıdır. ' +
      'İstifadəçilər simulyasiya tapşırıqlarını yerinə yetirir, AI ilə qiymətləndirilir və bacarıqlarını sübut edir; ' +
      'HR və müəllimlər isə nəticələri izləyib tapşırıq paylaşır.',
    { size: 10 }
  )
  y += 2
  paragraph(
    'Bu sənəd seçilmiş dövr üçün canlı verilənlər bazasından hesablanmış rəsmi admin xülasəsidir. ' +
      'Rəqəmlər endirmə anında yenidən hesablanır və ekrandakı köhnə dəyərlərdən asılı deyil.',
    { size: 9.5, color: [90, 94, 102] }
  )
  y += 3
  paragraph(buildOverviewNarrative(snapshot), { size: 10 })
  y += 4

  // ── 2. Platform baza ────────────────────────────────────────
  sectionTitle('2. Platform baza (ümumi)')
  kpiGrid(
    [
      { label: 'Ümumi istifadəçi', value: snapshot.totals.totalUsers },
      { label: 'Tələbə', value: snapshot.totals.students },
      { label: 'HR', value: snapshot.totals.hrUsers },
      { label: 'Kurs / müəllim', value: snapshot.totals.coursesUsers },
    ],
    4
  )
  paragraph(
    'Yuxarıdakı rəqəmlər bütün platforma tarixçəsini əhatə edir (dövr filtrindən asılı olmayaraq). ' +
      'Aşağıdakı bölmələr isə seçilmiş dövrə aiddir.',
    { size: 9, color: [90, 94, 102] }
  )
  y += 3

  // ── 3. Əsas göstəricilər ────────────────────────────────────
  sectionTitle(`3. Əsas göstəricilər (${rangeLabel.toLowerCase()})`)
  kpiGrid(
    [
      { label: 'Qeydiyyat (sign up)', value: c.signUps.total },
      { label: 'Giriş (sign in)', value: c.signIns.total },
      { label: 'Simulyasiya edənlər', value: c.uniqueSimulators },
      { label: 'Tapşırıq paylaşımı', value: c.tasksShared.total },
      { label: 'Ümumi klik', value: c.totalClicks },
      { label: 'Simulyasiya başladı', value: c.simulationsStarted },
      { label: 'Tamamlanan', value: c.simulationsCompleted },
      { label: 'Orta bal', value: c.avgScore ?? '—' },
    ],
    4
  )

  // ── 4. Qeydiyyat və giriş ───────────────────────────────────
  roleTable('4. Qeydiyyat (sign up) — rol üzrə', c.signUps)
  roleTable('5. Giriş (sign in) — rol üzrə', c.signIns)

  sectionTitle('6. Giriş cəhdləri')
  kvRow('Giriş cəhdi (cəmi)', c.loginAttempts, true)
  kvRow('Uğurlu giriş', c.signIns.total)
  kvRow('Uğursuz giriş', c.loginFailed)
  kvRow(
    'Uğur faizi',
    c.loginAttempts > 0 ? pct(c.signIns.total, c.loginAttempts) : '—'
  )
  y += 3

  // ── 7. Simulyasiya ──────────────────────────────────────────
  sectionTitle('7. Simulyasiya aktivliyi')
  kvRow('Unikal simulyasiya edənlər', c.uniqueSimulators, true)
  kvRow('Başlayan cəhdlər', c.simulationsStarted)
  kvRow('Tamamlanan cəhdlər', c.simulationsCompleted)
  kvRow('Tamamlama faizi', `${c.completionRate}%`)
  kvRow('Orta bal', c.avgScore ?? '—')
  y += 2
  paragraph(
    c.uniqueSimulators > 0
      ? `Dövrdə orta hesabla hər iştirakçıya ${(c.simulationsStarted / c.uniqueSimulators).toFixed(1)} simulyasiya cəhdi düşür.`
      : 'Bu dövrdə hələ simulyasiya cəhdi qeydə alınmayıb.',
    { size: 9, color: [90, 94, 102] }
  )
  y += 3

  // ── 8. Tapşırıq paylaşımı ───────────────────────────────────
  sectionTitle('8. Tapşırıq və simulyasiya paylaşımı')
  kvRow('Ümumi paylaşılan', c.tasksShared.total, true)
  kvRow('Kurs tapşırıqları (tələbəyə)', c.tasksShared.courseAssignments)
  kvRow('Qrup simulyasiya tapşırıqları', c.tasksShared.groupAssignments)
  kvRow('Yaradılan simulyasiyalar', c.tasksShared.hrSimulationsCreated)
  y += 2
  paragraph(
    'Kurs tapşırıqları müəllim→tələbə təyinatlarını, qrup tapşırıqları sinif qruplarına verilən simulyasiyaları, ' +
      'yaradılan simulyasiyalar isə dövrdə əlavə olunan yeni tapşırıq məzmununu göstərir.',
    { size: 9, color: [90, 94, 102] }
  )
  y += 3

  // ── 9. Trafik ───────────────────────────────────────────────
  sectionTitle('9. Trafik və kliklər')
  kvRow('Ümumi naviqasiya klikı', c.totalClicks, true)
  kvRow('Səhifə baxışı', c.pageViews)
  kvRow('Unikal ziyarətçi', c.uniqueVisitors)
  if (snapshot.events) {
    kvRow('Aktiv istifadəçi (event)', snapshot.events.active_users)
    kvRow('İnteraksiya hadisələri', snapshot.events.interaction_events)
  }
  y += 4

  // ── 10. Metodologiya ────────────────────────────────────────
  sectionTitle('10. Metodologiya və qeydlər')
  paragraph(
    '• Qeydiyyat rəqəmləri users cədvəlindən götürülür (tarixçə dəqiq və tamdır).',
    { size: 9 }
  )
  paragraph(
    '• Giriş (sign in) rəqəmləri analytics_events cədvəlindəki login_success hadisələrindən hesablanır.',
    { size: 9 }
  )
  paragraph(
    '• Simulyasiya göstəriciləri simulation_attempts cədvəlindən götürülür.',
    { size: 9 }
  )
  paragraph(
    '• Tapşırıq paylaşımı course_assignments, group_sim_assignments və simulations cədvəllərindən toplanır.',
    { size: 9 }
  )
  paragraph(
    '• Hesabat hər endirmədə server tərəfində yenidən hesablanır (live snapshot).',
    { size: 9 }
  )
  y += 4
  paragraph(`Snapshot vaxtı (UTC ISO): ${snapshot.generatedAt}`, {
    size: 8,
    color: [138, 138, 138],
  })
  paragraph(`Dövr başlanğıcı: ${formatAzDateTime(snapshot.since)}`, {
    size: 8,
    color: [138, 138, 138],
  })

  drawFooter()

  return doc.output('arraybuffer')
}
