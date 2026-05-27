import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, BarChart2, HelpCircle, Play, ArrowLeft, Building2, Trophy, CheckCircle2, Lock, Zap } from 'lucide-react'
import { getDifficultyClass, getDifficultyLabel } from '@/lib/utils'
import { canStudentAccessSimulation } from '@/lib/simulation-access'
import { normalizeQuestions } from '@/lib/questions'
import type { Question } from '@/types'
import { SimulationDetailTabs } from '@/components/simulation/SimulationDetailTabs'

export default async function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sim } = await supabase
    .from('simulations')
    .select('*, creator:users!created_by(full_name, company_name)')
    .eq('id', id)
    .single()

  if (!sim) notFound()

  const access = user
    ? await canStudentAccessSimulation(supabase, user.id, id)
    : { allowed: false, reason: 'locked' as const }
  const isLocked = !access.allowed

  const questions = normalizeQuestions(sim.questions)
  const initial = (sim.creator?.company_name || sim.title)[0]?.toUpperCase() || 'J'

  return (
    <div className="relative -mx-4 lg:-mx-8">

      {/* ============ BACK LINK ============ */}
      <div className="px-4 lg:px-8">
        <Link
          href="/student/simulations"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-mid hover:text-forest transition-colors mb-6"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Bütün simulyasiyalar
        </Link>
      </div>

      {/* ============ HERO ============ */}
      <header className="px-4 lg:px-8 pb-10 border-b border-forest/8 relative overflow-hidden">
        {/* Soft glow */}
        <div className="absolute -top-20 right-0 w-[60vw] h-[40vh] opacity-30 pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(244,126,71,0.15), transparent 60%)', filter: 'blur(80px)' }}
             aria-hidden="true" />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            {/* Eyebrow with company */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-forest text-cream font-display text-2xl font-semibold flex items-center justify-center shadow-soft">
                {initial}
              </div>
              <div>
                <span className="h-eyebrow block mb-0.5">
                  {sim.creator?.company_name ? 'From' : 'JobSim Original'}
                </span>
                {sim.creator?.company_name && (
                  <p className="font-display text-lg font-semibold text-ink">{sim.creator.company_name}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-semibold text-balance mb-4">
              {sim.title}
            </h1>

            <p className="text-base lg:text-lg text-ink-mid max-w-2xl leading-relaxed mb-6">
              {sim.description}
            </p>

            {/* Meta pills (Forage style) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag-neutral">
                <BarChart2 size={11} aria-hidden="true" />
                {sim.role_type}
              </span>
              <span className={getDifficultyClass(sim.difficulty)}>
                {getDifficultyLabel(sim.difficulty)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-ink-mid bg-cream-deep border border-forest/10">
                <Clock size={11} aria-hidden="true" />
                {sim.duration_minutes} dəq
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-ink-mid bg-cream-deep border border-forest/10">
                <HelpCircle size={11} aria-hidden="true" />
                {questions.length} tapşırıq
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-success bg-success-tint border border-success/25">
                <Trophy size={11} aria-hidden="true" />
                Sertifikatlı
              </span>
            </div>
          </div>

          {/* Right: hero CTA card (desktop) */}
          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="card p-6">
              {isLocked ? (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold mb-1">Premium tələb olunur</p>
                  <p className="font-display text-2xl font-semibold mb-4 leading-tight">
                    Bu simulyasiya <span className="italic font-light text-coral">Premium</span> üzvlər üçündür.
                  </p>
                  <Link href="/student/premium" className="btn-coral w-full justify-center py-3.5 mb-3">
                    <Zap size={16} aria-hidden="true" />
                    Premium-a keç
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold mb-1">100% pulsuz</p>
                  <p className="font-display text-2xl font-semibold mb-4 leading-tight">
                    Bu gün <span className="italic font-light text-forest">başla.</span>
                  </p>
                  <Link
                    href={`/student/simulations/${id}/start`}
                    className="btn-coral w-full justify-center py-3.5 mb-3"
                  >
                    <Play size={16} aria-hidden="true" />
                    Simulyasiyanı başlat
                  </Link>
                </>
              )}
              <ul className="text-xs text-ink-mid space-y-1.5 mt-4">
                {['Self-paced', 'Pauza yox · 1 oturuş', 'AI qiymətləndirmə', 'Sertifikat & pasport'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-forest shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </header>

      {/* ============ TABS ============ */}
      <div className="px-4 lg:px-8">
        <SimulationDetailTabs
          description={sim.description}
          durationMinutes={sim.duration_minutes}
          roleType={sim.role_type}
          questions={questions}
          companyName={sim.creator?.company_name || null}
          creatorName={sim.creator?.full_name || null}
        />
      </div>

      {/* ============ MOBILE STICKY CTA ============ */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 z-30 bg-cream/95 backdrop-blur-sm border-t border-forest/10 px-4 py-3 mt-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {isLocked ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold flex items-center gap-1">
                  <Lock size={10} aria-hidden="true" /> Premium
                </p>
                <p className="text-sm font-semibold text-ink truncate">Premium tələb olunur</p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">100% pulsuz</p>
                <p className="text-sm font-semibold text-ink truncate">{sim.title}</p>
              </>
            )}
          </div>
          {isLocked ? (
            <Link href="/student/premium" className="btn-coral px-5 py-3 shrink-0">
              <Zap size={14} aria-hidden="true" />
              Premium
            </Link>
          ) : (
            <Link
              href={`/student/simulations/${id}/start`}
              className="btn-coral px-5 py-3 shrink-0"
            >
              <Play size={14} aria-hidden="true" />
              Başlat
            </Link>
          )}
        </div>
      </div>

      {/* ============ FOOTER CTA (final) ============ */}
      <div className="px-4 lg:px-8 mt-12">
        <div className="card-feature p-8 lg:p-12 text-cream text-center">
          <div className="max-w-2xl mx-auto">
            <Building2 size={24} className="text-sun mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-3 leading-tight">
              Hazırsınız?{' '}
              <span className="italic font-light text-sun">Növbəti karyera</span><br />
              addımınız buradan başlayır.
            </h2>
            <p className="text-sm lg:text-base text-cream/80 mb-6 leading-relaxed">
              {questions.length} tapşırıq · {sim.duration_minutes} dəqiqə · AI qiymətləndirmə · Sertifikat
            </p>
            <Link
              href={isLocked ? '/student/premium' : `/student/simulations/${id}/start`}
              className="inline-flex items-center gap-2 bg-coral hover:bg-coral-deep text-white font-medium px-7 py-3.5 rounded-full transition-colors group"
            >
              {isLocked ? <Zap size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {isLocked ? 'Premium-a keç' : 'Simulyasiyanı başlat'}
              <span className="ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
