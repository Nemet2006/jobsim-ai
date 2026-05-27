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
            Salam,{' '}
            <span className="italic font-light text-forest">{firstName}</span>.<br />
            Bu gün hansı işi keçəcəyik?
          </>
        }
        dek={
          <>
            Real iş simulyasiyaları, ekspert qiymətləndirməsi, və{' '}
            <strong className="text-ink">karyera sübutu</strong>.
            Hər tapşırıq bir addım — bacarıqlarınızı dünyaya göstərin.
          </>
        }
        actions={
          <>
            <Link href="/student/simulations" className="btn-coral group">
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
                  <article className="card p-5 group hover:shadow-soft-md hover:border-forest/20 transition-all hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-forest text-cream flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <PlaySquare size={18} aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink truncate group-hover:text-forest transition-colors">
                          {(attempt.simulation as { title: string } | null)?.title || 'Simulyasiya'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-ink-mute font-medium">
                          <Clock size={11} aria-hidden="true" />
                          <time dateTime={attempt.started_at}>{formatDate(attempt.started_at)}</time>
                          {attempt.status === 'in_progress' && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-ink-mute" aria-hidden="true" />
                              <span className="text-coral-deep font-semibold">Davam edir</span>
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
            <div className="card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-forest-wash flex items-center justify-center">
                <PlaySquare size={28} className="text-forest" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Boş səhifə</h3>
              <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
                Hələ heç bir simulyasiya başlamamısınız. Karyera hekayəniz buradan başlayır.
              </p>
              <Link href="/student/simulations" className="btn-coral inline-flex">
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
              <div className="card-feature p-7 text-cream">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Premium</span>
                </div>
                <h3 className="font-display text-3xl font-semibold mb-3 leading-tight">
                  Növbəti<br />
                  <span className="italic font-light text-sun">səviyyə.</span>
                </h3>
                <p className="text-sm text-cream/80 mb-6 leading-relaxed">
                  Sınırsız simulyasiya, dərin AI analiz, və sertifikatlı bacarıq pasportu.
                </p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Sınırsız simulyasiyalar',
                    'Dərin AI analiz',
                    'Premium sertifikat',
                    'HR-a birbaşa müraciət',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-cream/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-sun shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <PremiumUpgradeButton className="w-full">
                  İndi Yüksəlt
                </PremiumUpgradeButton>
              </div>
            ) : (
              <div className="card-feature p-7 text-cream">
                <div className="w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center mb-4">
                  <Zap size={20} fill="currentColor" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">Premium üzv.</h3>
                <p className="text-sm text-cream/80">Bütün imtiyazlarınız aktivdir.</p>
              </div>
            )}
          </FadeInUp>

          {/* Testimonial / motivation */}
          <FadeInUp delay={0.3}>
            <div className="card-feature-light p-6">
              <Trophy size={18} className="text-coral mb-3" aria-hidden="true" />
              <blockquote className="font-display text-lg italic text-ink leading-snug mb-3">
                &ldquo;Bacarıq təcrübədə sübut olunur, CV-də deyil.&rdquo;
              </blockquote>
              <footer className="text-xs text-ink-mute font-medium">— JobSim Insight</footer>
            </div>
          </FadeInUp>
        </aside>
      </div>
    </div>
  )
}
