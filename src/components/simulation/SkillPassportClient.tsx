'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import type { Skill } from '@/types'
import { Award, Download, Share2 } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'

interface SkillPassportClientProps {
  skills: Skill[]
  studentName: string
  university: string
}

const SKILL_LABELS: Record<string, string> = {
  communication: 'Ünsiyyət',
  problem_solving: 'Problem Həll',
  analytical_thinking: 'Analitik Düşüncə',
  structure: 'Struktur',
  creativity: 'Yaradıcılıq',
}

const LEVEL_COLORS: Record<string, string> = {
  Expert:       'text-forest bg-forest-wash border-forest/20',
  Advanced:     'text-info bg-info-tint border-info/20',
  Intermediate: 'text-coral-deep bg-coral-wash border-coral/20',
  Beginner:     'text-ink-mid bg-cream-deep border-forest/10',
}

export default function SkillPassportClient({ skills, studentName, university }: SkillPassportClientProps) {
  const radarData = skills.map((s) => ({
    subject: SKILL_LABELS[s.skill_name] || s.skill_name,
    score: s.score,
    fullMark: 100,
  }))

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFillColor(250, 245, 236)
    doc.rect(0, 0, 210, 297, 'F')

    doc.setTextColor(31, 78, 74)
    doc.setFontSize(28)
    doc.text('JobSim AI', 20, 30)

    doc.setTextColor(26, 26, 26)
    doc.setFontSize(16)
    doc.text('Bacarıq Pasportu', 20, 45)

    doc.setTextColor(92, 92, 92)
    doc.setFontSize(11)
    doc.text(studentName, 20, 58)
    if (university) doc.text(university, 20, 67)

    doc.setTextColor(26, 26, 26)
    doc.setFontSize(13)
    doc.text('Bacarıqlar', 20, 82)

    skills.forEach((skill, i) => {
      const y = 95 + i * 15
      doc.setTextColor(92, 92, 92)
      doc.setFontSize(10)
      doc.text(SKILL_LABELS[skill.skill_name] || skill.skill_name, 20, y)
      doc.setTextColor(31, 78, 74)
      doc.text(`${skill.score}/100 — ${skill.level}`, 100, y)
    })

    doc.save(`${studentName}-skill-passport.pdf`)
  }

  if (skills.length === 0) {
    return (
      <div>
        <EditorialHero
          eyebrow="Bacarıq Pasportu"
          title={<>Hələ boş<span className="text-coral">.</span></>}
          dek="Simulyasiyaları tamamlayın — AI bacarıqlarınızı avtomatik qiymətləndirəcək."
        />
        <div className="card p-12 text-center">
          <Award size={48} className="text-forest/30 mx-auto mb-4" aria-hidden="true" />
          <p className="text-ink-mid">Hələ bacarıq yoxdur. Simulyasiyaları tamamlayın.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <EditorialHero
        eyebrow="Bacarıq Pasportu"
        title={
          <>
            {studentName.split(' ')[0]}&apos;in{' '}
            <span className="italic font-light text-forest">bacarıqları</span>.
          </>
        }
        dek={university || 'Simulyasiya nəticələrinə əsaslanır'}
        actions={
          <>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Share2 size={14} aria-hidden="true" />
              Paylaş
            </button>
            <button onClick={handleDownloadPDF} className="btn-coral flex items-center gap-2 text-sm">
              <Download size={14} aria-hidden="true" />
              PDF
            </button>
          </>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Bacarıq Xəritəsi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(31,78,74,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#5C5C5C', fontSize: 11 }} />
              <Radar
                name="Skor"
                dataKey="score"
                stroke="#1F4E4A"
                fill="#1F4E4A"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Cards */}
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.skill_name} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-ink">
                  {SKILL_LABELS[skill.skill_name] || skill.skill_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-display font-semibold text-forest">{skill.score}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[skill.level]}`}>
                    {skill.level}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-forest/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full transition-all duration-1000"
                  style={{ width: `${skill.score}%` }}
                  role="progressbar"
                  aria-valuenow={skill.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill development tips — no fake external course links */}
      <div className="card p-5">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">İnkişaf tövsiyələri</h2>
        <ul className="space-y-2 text-sm text-ink-mid">
          <li className="flex items-start gap-2">
            <span className="text-forest font-semibold shrink-0">·</span>
            Zəif bal aldığınız bacarıqlar üzrə əlavə simulyasiya keçin
          </li>
          <li className="flex items-start gap-2">
            <span className="text-forest font-semibold shrink-0">·</span>
            AI geri-bildirimindəki tövsiyələri növbəti attempt-də tətbiq edin
          </li>
          <li className="flex items-start gap-2">
            <span className="text-forest font-semibold shrink-0">·</span>
            Universitet qrupunuzda müəllim tərəfindən verilən tapşırıqları tamamlayın
          </li>
        </ul>
      </div>
    </div>
  )
}
