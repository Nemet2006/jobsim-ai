export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Star, Plus, ArrowRight, BarChart2 } from 'lucide-react'
import { formatDate, getScoreColor } from '@/lib/utils'
import { StatGrid, type StatItem } from '@/components/ui/StatGrid'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/Motion'

export default async function HRDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: simulations }, { data: shortlist }] = await Promise.all([
    supabase.from('users').select('company_name, full_name').eq('id', user!.id).single(),
    supabase.from('simulations').select('id, title, is_published').eq('created_by', user!.id),
    supabase.from('shortlist').select('id').eq('hr_id', user!.id),
  ])

  const simIds = (simulations || []).map((s) => s.id)
  let allAttempts: { score: number | null; student_id: string }[] = []
  let recentAttempts: { id: string; score: number | null; student_name: string; university: string | null; started_at: string; sim_title: string }[] = []

  if (simIds.length > 0) {
    const { data: attempts } = await supabase
      .from('simulation_attempts')
      .select('id, score, student_id, started_at, simulation_id')
      .in('simulation_id', simIds)
      .eq('status', 'completed')
    allAttempts = (attempts || []).map((a) => ({ score: a.score, student_id: a.student_id }))

    const recent = (attempts || [])
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 6)

    for (const attempt of recent) {
      const [{ data: studentData }, { data: simData }] = await Promise.all([
        supabase.from('users').select('full_name, university').eq('id', attempt.student_id).single(),
        supabase.from('simulations').select('title').eq('id', attempt.simulation_id).single(),
      ])
      recentAttempts.push({
        id: attempt.id,
        score: attempt.score,
        student_name: studentData?.full_name || 'Namizəd',
        university: studentData?.university || null,
        started_at: attempt.started_at,
        sim_title: simData?.title || '',
      })
    }
  }

  const uniqueStudents = new Set(allAttempts.map((a) => a.student_id)).size
  const avgScore = allAttempts.length
    ? Math.round(allAttempts.reduce((s, a) => s + (a.score || 0), 0) / allAttempts.length)
    : 0
  const activePublished = (simulations || []).filter((s) => s.is_published).length

  const stats: StatItem[] = [
    { label: 'Aktiv sim.', value: activePublished, icon: 'play', accent: 'navy', meta: `${simulations?.length || 0} ümumi` },
    { label: 'Namizəd', value: uniqueStudents, icon: 'users', accent: 'gold', meta: 'Unikal qatılan' },
    { label: 'Orta bal', value: avgScore, icon: 'chart', accent: 'verdigris', meta: 'Bütün cəhdlər' },
    { label: 'Shortlist', value: shortlist?.length || 0, icon: 'star', accent: 'gold', meta: 'Seçilmiş' },
  ]

  const quickActions = [
    { href: '/hr/simulations/create', label: 'Yeni simulyasiya', desc: 'Sıfırdan və ya AI ilə yarat', primary: true },
    { href: '/hr/candidates', label: 'Namizədlər', desc: 'Bütün cəhdləri analiz et' },
    { href: '/hr/shortlist', label: 'Shortlist', desc: 'Seçilmiş namizədlər' },
    { href: '/hr/compare', label: 'Müqayisə', desc: 'Yan-yana qiymətləndir' },
  ]

  return (
    <div className="relative">
      <EditorialHero
        eyebrow="HR Paneli"
        title={
          <>
            <span className="text-navy">{profile?.company_name || 'Sizin şirkət'}</span>{' '}
            hiring ledger.
          </>
        }
        dek={
          <>
            Namizədlər simulyasiyada real iş tapşırıqlarını tamamlayır — siz isə{' '}
            <strong className="text-ink">sübut olunmuş nəticə</strong> görürsünüz.
          </>
        }
        actions={
          <>
            <Link href="/hr/simulations/create" className="btn-primary group">
              <Plus size={16} aria-hidden="true" />
              <span>Simulyasiya yarat</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/hr/candidates" className="btn-secondary">
              <Users size={14} aria-hidden="true" />
              Namizədlərə bax
            </Link>
          </>
        }
        meta={[
          { label: 'HR', value: profile?.full_name || '—' },
          { label: 'Aktiv', value: `${activePublished} sim` },
          { label: 'Namizəd', value: `${uniqueStudents} unikal` },
        ]}
      />

      <FadeInUp>
        <StatGrid stats={stats} />
      </FadeInUp>

      <div className="mt-12 grid lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Latest candidates */}
        <section className="lg:col-span-2" aria-labelledby="recent-candidates">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="h-eyebrow block mb-1.5">Son namizədlər</span>
              <h2 id="recent-candidates" className="font-display text-2xl lg:text-3xl font-semibold">
                Yeni müraciətlər
              </h2>
            </div>
            <Link href="/hr/candidates" className="link-arrow text-sm">
              Hamısı <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {recentAttempts.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {recentAttempts.map((attempt) => (
                <StaggerItem key={attempt.id}>
                  <article className="card p-5 group hover:shadow-soft-md hover:border-navy/20 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-navy text-paper font-display font-semibold text-base flex items-center justify-center">
                          {attempt.student_name[0]?.toUpperCase() || 'N'}
                        </div>
                        {attempt.score !== null && attempt.score >= 80 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-md bg-gold text-navy-deep flex items-center justify-center shadow-soft" aria-label="Top performer">
                            <Star size={10} fill="currentColor" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink truncate group-hover:text-navy transition-colors">
                          {attempt.student_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-mute font-medium">
                          <span className="truncate">{attempt.sim_title}</span>
                          {attempt.university && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-ink-mute" aria-hidden="true" />
                              <span className="truncate">{attempt.university}</span>
                            </>
                          )}
                        </div>
                        <time className="block mt-0.5 text-[10px] text-ink-mute uppercase tracking-wider font-medium" dateTime={attempt.started_at}>
                          {formatDate(attempt.started_at)}
                        </time>
                      </div>

                      {attempt.score !== null && (
                        <div className="text-right shrink-0">
                          <p className={`number-display text-3xl ${getScoreColor(attempt.score)}`}>
                            {attempt.score}
                          </p>
                          <p className="text-[10px] text-ink-mute uppercase tracking-wider font-semibold">/ 100</p>
                        </div>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gold-wash flex items-center justify-center">
                <Users size={28} className="text-gold-deep" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Hələ namizəd yoxdur</h3>
              <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
                İlk simulyasiyanızı yaradın, paylaşın, ən yaxşı namizədlər gəlsin.
              </p>
              <Link href="/hr/simulations/create" className="btn-primary inline-flex">
                <Plus size={14} aria-hidden="true" />
                İlk simulyasiyanı yarat
              </Link>
            </div>
          )}
        </section>

        {/* Quick actions side */}
        <aside aria-labelledby="actions-title">
          <div className="mb-4">
            <span className="h-eyebrow block mb-1.5">İş axını</span>
            <h2 id="actions-title" className="font-display text-2xl lg:text-3xl font-semibold">
              Sürətli əməliyyatlar
            </h2>
          </div>

          <StaggerContainer className="space-y-3">
            {quickActions.map((item) => (
              <StaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className={`group block p-5 rounded-lg border transition-all hover:-translate-y-0.5 ${
                    item.primary
                      ? 'bg-navy text-paper border-navy hover:bg-navy-deep hover:shadow-soft-md'
                      : 'bg-white border-navy/8 hover:border-navy/20 hover:shadow-soft-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`font-display text-lg font-semibold mb-0.5 ${
                        item.primary ? 'text-paper' : 'text-ink group-hover:text-navy'
                      }`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${item.primary ? 'text-paper/85' : 'text-ink-mute'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`shrink-0 mt-1 transition-transform group-hover:translate-x-1 ${
                      item.primary ? 'text-paper' : 'text-ink-mute group-hover:text-navy'
                    }`} aria-hidden="true" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="card-dossier p-5 mt-6">
            <BarChart2 size={18} className="text-navy mb-3" aria-hidden="true" />
            <p className="font-display text-base font-semibold text-ink leading-snug mb-1">
              Qiymətləndirmə prinsipi
            </p>
            <p className="text-sm text-ink-mid leading-relaxed">
              Ən güclü siqnal — namizədin real tapşırıqdakı performansı, resume mətnindəki iddialar deyil.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
