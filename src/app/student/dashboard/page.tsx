export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlaySquare, ArrowRight, Clock, Zap, Trophy, Sparkles } from 'lucide-react'
import { formatDate, getScoreColor } from '@/lib/utils'
import { StatGrid, type StatItem } from '@/components/ui/StatGrid'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PremiumUpgradeButton } from '@/components/student/PremiumUpgradeButton'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/Motion'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: attempts }, { data: passport }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase
      .from('simulation_attempts')
      .select('*, simulation:simulations(title, role_type)')
      .eq('student_id', user!.id)
      .order('started_at', { ascending: false })
      .limit(6),
    supabase.from('skill_passport').select('*').eq('student_id', user!.id).single(),
  ])

  const completedAttempts = attempts?.filter((a) => a.status === 'completed') || []
  const avgScore = completedAttempts.length
    ? Math.round(completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length)
    : 0
  const skillCount = (passport?.skills as { skill_name: string }[] | null)?.length || 0
  const firstName = profile?.full_name?.split(' ')[0] || 'dostum'

  const stats: StatItem[] = [
    { label: 'Cəhdlər', value: attempts?.length || 0, icon: 'play', accent: 'forest', meta: 'Ümumi sayı' },
    { label: 'Orta bal', value: avgScore, icon: 'target', accent: 'coral', meta: 'Son cəhdlər' },
    { label: 'Bacarıqlar', value: skillCount, icon: 'award', accent: 'sun', meta: 'Pasportda' },
    {
      label: 'Status',
      value: profile?.is_premium ? 'Premium' : 'Free',
      icon: 'zap',
      accent: profile?.is_premium ? 'coral' : 'neutral',
      meta: profile?.is_premium ? 'Aktiv üzv' : 'Yüksəlt',
    },
  ]

  return (
    <div className="relative">
      <EditorialHero
        eyebrow="Tələbə Paneli"
        title={
          <>
            Salam, <span className="text-navy">{firstName}</span>.<br />
            Bu gün hansı bacarığı sübut edəcəksiniz?
          </>
        }
        dek={
          <>
            Real iş simulyasiyaları, AI qiymətləndirmə və{' '}
            <strong className="text-ink">verification seal</strong>.
            Hər tamamlanmış tapşırıq — dossier-inizə bir qeyd.
          </>
        }
        actions={
          <>
            <Link href="/student/simulations" className="btn-primary group">
              <PlaySquare size={16} aria-hidden="true" />
              <span>Simulyasiya başlat</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/student/skill-passport" className="btn-secondary">
              <Sparkles size={14} aria-hidden="true" />
              Bacarıq pasportu
            </Link>
          </>
        }
        meta={[
          { label: 'Universitet', value: profile?.university || 'Qeyd edilməyib' },
          { label: 'Üzvlük', value: profile?.is_premium ? 'Premium' : 'Free' },
          { label: 'Cəhdlər', value: `${attempts?.length || 0}` },
        ]}
      />

      <FadeInUp>
        <StatGrid stats={stats} />
      </FadeInUp>

      {/* Two-column layout */}
      <div className="mt-12 grid lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Recent activity (2 cols) */}
        <section className="lg:col-span-2" aria-labelledby="recent-work">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="h-eyebrow block mb-1.5">Son fəaliyyət</span>
              <h2 id="recent-work" className="font-display text-2xl lg:text-3xl font-semibold">
                Davam etdiyiniz işlər
              </h2>
            </div>
            <Link href="/student/results" className="link-arrow text-sm">
              Hamısı <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {attempts && attempts.length > 0 ? (
            <StaggerContainer className="space-y-3">
              {attempts.map((attempt) => (
                <StaggerItem key={attempt.id}>
                  <article className="card-dossier p-4 group hover:shadow-soft-md hover:border-navy/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-navy text-paper flex items-center justify-center shrink-0">
                        <PlaySquare size={16} aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-semibold text-ink truncate group-hover:text-navy transition-colors">
                          {(attempt.simulation as { title: string } | null)?.title || 'Simulyasiya'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-ink-mute font-medium">
                          <Clock size={11} aria-hidden="true" />
                          <time dateTime={attempt.started_at}>{formatDate(attempt.started_at)}</time>
                          {attempt.status === 'in_progress' && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-ink-mute" aria-hidden="true" />
                              <span className="text-gold-deep font-semibold">Davam edir</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {attempt.status === 'completed' && attempt.score !== null ? (
                          <>
                            <p className={`number-display text-3xl ${getScoreColor(attempt.score)}`}>
                              {attempt.score}
                            </p>
                            <p className="text-[10px] text-ink-mute uppercase tracking-wider font-semibold">/ 100</p>
                          </>
                        ) : attempt.status === 'in_progress' ? (
                          <span className="tag-coral">Davam edir</span>
                        ) : (
                          <span className="tag-danger">Ləğv</span>
                        )}
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="card-dossier p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-md bg-navy-wash flex items-center justify-center">
                <PlaySquare size={24} className="text-navy" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Dossier boşdur</h3>
              <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
                Hələ heç bir simulyasiya başlamamısınız. İlk verification seal buradan başlayır.
              </p>
              <Link href="/student/simulations" className="btn-primary inline-flex">
                İlk simulyasiyanı başlat
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* Side: Premium / motivation */}
        <aside className="space-y-6" aria-label="Yan panel">
          <FadeInUp delay={0.2}>
            {!profile?.is_premium ? (
              <div className="card-feature p-6 text-paper">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={15} aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Premium</span>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2 leading-tight">
                  Növbəti səviyyə
                </h3>
                <p className="text-sm text-paper/75 mb-5 leading-relaxed">
                  Sınırsız simulyasiya, dərin AI analiz və verification seal.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Sınırsız simulyasiyalar',
                    'Dərin AI analiz',
                    'Premium sertifikat',
                    'HR-a birbaşa müraciət',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-paper/85">
                      <span className="w-1.5 h-1.5 rounded-sm bg-gold shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <PremiumUpgradeButton className="w-full">
                  İndi Yüksəlt
                </PremiumUpgradeButton>
              </div>
            ) : (
              <div className="card-feature p-6 text-paper">
                <div className="w-10 h-10 rounded-md bg-gold text-white flex items-center justify-center mb-3">
                  <Zap size={18} fill="currentColor" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-1.5">Premium üzv</h3>
                <p className="text-sm text-paper/75">Bütün imtiyazlarınız aktivdir.</p>
              </div>
            )}
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="card-dossier p-5">
              <Trophy size={16} className="text-gold mb-2.5" aria-hidden="true" />
              <blockquote className="font-display text-base text-ink leading-snug mb-2">
                &ldquo;Bacarıq təcrübədə sübut olunur, CV-də deyil.&rdquo;
              </blockquote>
              <footer className="text-[10px] uppercase tracking-[0.12em] text-ink-mute font-semibold">JobSim Insight</footer>
            </div>
          </FadeInUp>
        </aside>
      </div>
    </div>
  )
}
