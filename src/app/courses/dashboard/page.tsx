export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Trophy, ArrowRight, ClipboardList, GraduationCap, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { StatGrid, type StatItem } from '@/components/ui/StatGrid'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/Motion'

export default async function CoursesDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: assignments }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user!.id).single(),
    supabase
      .from('course_assignments')
      .select('student_id, simulation_id')
      .eq('instructor_id', user!.id),
  ])

  const studentIds = [...new Set((assignments || []).map((a) => a.student_id))]
  const simIds = [...new Set((assignments || []).map((a) => a.simulation_id))]

  let completedAttempts: { student_id: string; score: number | null }[] = []
  const avgScores: Record<string, number> = {}

  if (studentIds.length > 0 && simIds.length > 0) {
    const { data: attempts } = await supabase
      .from('simulation_attempts')
      .select('student_id, score')
      .in('student_id', studentIds)
      .in('simulation_id', simIds)
      .eq('status', 'completed')
    completedAttempts = (attempts || []).map((a) => ({ student_id: a.student_id, score: a.score }))

    studentIds.forEach((sid) => {
      const studentAttempts = completedAttempts.filter((a) => a.student_id === sid)
      avgScores[sid] = studentAttempts.length
        ? Math.round(studentAttempts.reduce((s, a) => s + (a.score || 0), 0) / studentAttempts.length)
        : 0
    })
  }

  const completionRate = studentIds.length > 0
    ? Math.round((new Set(completedAttempts.map((a) => a.student_id)).size / studentIds.length) * 100)
    : 0
  const overallAvg = completedAttempts.length
    ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length)
    : 0

  const completedByStudent = new Map<string, number>()
  for (const a of completedAttempts) {
    completedByStudent.set(a.student_id, (completedByStudent.get(a.student_id) || 0) + 1)
  }

  const { data: students } = studentIds.length
    ? await supabase.from('users').select('id, full_name, university').in('id', studentIds)
    : { data: [] as { id: string; full_name: string | null; university: string | null }[] }
  const studentById = new Map((students || []).map((s) => [s.id, s]))

  const leaderboard = studentIds
    .map((sid) => {
      const studentData = studentById.get(sid)
      return {
        id: sid,
        name: studentData?.full_name || 'Tələbə',
        university: studentData?.university || null,
        avg: avgScores[sid] || 0,
        completed: completedByStudent.get(sid) || 0,
      }
    })
    .sort((a, b) => b.avg - a.avg)
  const firstName = profile?.full_name?.split(' ')[0] || 'müəllim'

  const stats: StatItem[] = [
    { label: 'Tələbələr', value: studentIds.length, icon: 'users', accent: 'navy', meta: 'Aktiv qrupda' },
    { label: 'Tamamlama', value: completionRate, suffix: '%', icon: 'check', accent: 'verdigris', meta: 'Engagement' },
    { label: 'Orta bal', value: overallAvg, icon: 'chart', accent: 'gold', meta: 'Bütün cəhdlər' },
    { label: 'Tapşırıqlar', value: assignments?.length || 0, icon: 'clipboard', accent: 'gold', meta: 'Verilmiş' },
  ]

  return (
    <div className="relative">
      <EditorialHero
        eyebrow="Müəllim Paneli"
        title={
          <>
            Salam, <span className="text-navy">{firstName}</span>.<br />
            Sinif ledger-iniz hazırdır.
          </>
        }
        dek={
          <>
            Tələbələrin <strong className="text-ink">sübut olunmuş tərəqqisi</strong> —
            qiymət vərəqəsi deyil, simulyasiyada göstərilən real bacarıq.
          </>
        }
        actions={
          <>
            <Link href="/courses/assign" className="btn-primary group">
              <ClipboardList size={16} aria-hidden="true" />
              <span>Tapşırıq ver</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/courses/leaderboard" className="btn-secondary">
              <Trophy size={14} aria-hidden="true" />
              Reytinq
            </Link>
          </>
        }
        meta={[
          { label: 'Müəllim', value: profile?.full_name || '—' },
          { label: 'Sinif', value: `${studentIds.length} tələbə` },
          { label: 'Aktiv', value: `${assignments?.length || 0} tapşırıq` },
        ]}
      />

      <FadeInUp>
        <StatGrid stats={stats} />
      </FadeInUp>

      <div className="mt-12 grid lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2" aria-labelledby="top-students">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="h-eyebrow block mb-1.5">Lider tələbələr</span>
              <h2 id="top-students" className="font-display text-2xl lg:text-3xl font-semibold">
                Top performans
              </h2>
            </div>
            <Link href="/courses/leaderboard" className="link-arrow text-sm">
              Hamısı <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {leaderboard.slice(0, 6).length > 0 ? (
            <StaggerContainer className="space-y-3">
              {leaderboard.slice(0, 6).map((s, i) => {
                const isTop3 = i < 3
                const rankConfig = isTop3
                  ? [
                      'bg-gold text-navy-deep',
                      'bg-navy text-paper',
                      'bg-verdigris text-paper',
                    ][i]
                  : 'bg-paper-deep text-ink-mid border border-navy/8'

                return (
                  <StaggerItem key={s.id}>
                    <article className="card-dossier p-5 group hover:shadow-soft-md hover:border-navy/20 transition-all hover:-translate-y-0.5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg font-display font-semibold text-lg flex items-center justify-center shrink-0 ${rankConfig}`}
                          aria-label={`${i + 1}-ci yer`}
                        >
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-semibold text-ink truncate group-hover:text-navy transition-colors">
                            {s.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-mute font-medium">
                            <span>{s.completed} cəhd</span>
                            {s.university && (
                              <>
                                <span className="w-1 h-1 rounded-md bg-ink-mute" aria-hidden="true" />
                                <span className="truncate">{s.university}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`number-display text-3xl ${isTop3 ? 'text-gold-deep' : 'text-ink'}`}>
                            {s.avg}
                          </p>
                          <p className="text-[10px] text-ink-mute uppercase tracking-wider font-semibold">/ 100</p>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          ) : (
            <div className="card-dossier p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-navy-wash flex items-center justify-center">
                <GraduationCap size={28} className="text-navy" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Hələ tələbə yoxdur</h3>
              <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
                Tələbələrinizə tapşırıq verin və ilk nəticələri görün.
              </p>
              <Link href="/courses/assign" className="btn-primary inline-flex">
                <ClipboardList size={14} aria-hidden="true" />
                İlk tapşırığı ver
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-6" aria-label="Yan panel">
          <FadeInUp delay={0.2}>
            <div className="card-feature p-7 text-paper">
              <Trophy size={20} className="text-gold mb-4" aria-hidden="true" />
              <h3 className="font-display text-3xl font-semibold mb-3 leading-tight">
                Sinif <span className="text-gold">{completionRate}%</span><br />
                tamamladı
              </h3>
              <p className="text-sm text-paper/80 leading-relaxed">
                {completionRate >= 75
                  ? 'Sinif aktivdir. Növbəti çətinlik səviyyəsinə keçin.'
                  : completionRate >= 50
                  ? 'Yaxşı tempdə davam edir. Geridə qalanlara fərdi diqqət lazım ola bilər.'
                  : 'Motivasiyanı dəstəkləyin. Daha qısa simulyasiyalar sınamağa dəyər.'}
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <Link href="/courses/abonelik" className="card-feature p-6 block text-paper hover:shadow-soft-md transition-shadow">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-soft mb-2">
                Abunəlik
              </p>
              <p className="font-display text-2xl font-semibold mb-1">$2,499 / il</p>
              <p className="text-sm text-paper/80 leading-relaxed mb-3">
                Kampus planı — qruplar, tapşırıqlar və tələbə–HR axını. Qiymət buradan başlayır.
              </p>
              <span className="text-sm font-semibold text-gold-soft">Planı gör →</span>
            </Link>
          </FadeInUp>

          <FadeInUp delay={0.35}>
            <div className="card-dossier p-6">
              <BarChart2 size={18} className="text-navy mb-3" aria-hidden="true" />
              <p className="font-display text-base font-semibold text-ink leading-snug mb-1">
                Qiymətləndirmə prinsipi
              </p>
              <p className="text-sm text-ink-mid leading-relaxed">
                Tərəqqi simulyasiya nəticələri ilə ölçülür — yoxlama vərəqəsi ilə deyil.
              </p>
            </div>
          </FadeInUp>
        </aside>
      </div>
    </div>
  )
}
