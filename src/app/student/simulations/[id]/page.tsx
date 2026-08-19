import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, BarChart2, HelpCircle, Play, ArrowLeft, Building2, Trophy, CheckCircle2 } from 'lucide-react'
import { getDifficultyClass } from '@/lib/utils'
import { getT } from '@/i18n/get-locale'
import { localizeOrTranslateSimulation } from '@/lib/ensure-sim-english'
import { SimulationDetailTabs } from '@/components/simulation/SimulationDetailTabs'

export default async function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sim } = await supabase
    .from('simulations')
    .select('*, creator:users!created_by(full_name, company_name)')
    .eq('id', id)
    .single()

  if (!sim) notFound()

  const { locale, t } = await getT()
  const localized = await localizeOrTranslateSimulation(sim, locale)
  const questions = localized.questions
  const initial = (sim.creator?.company_name || localized.title)[0]?.toUpperCase() || 'J'
  const startHref = `/student/simulations/${id}/start`
  const diffKey = sim.difficulty === 'easy' ? 'sim.easy' : sim.difficulty === 'hard' ? 'sim.hard' : 'sim.medium'

  return (
    <div className="relative -mx-4 lg:-mx-8">
      <div className="px-4 lg:px-8">
        <Link
          href="/student/simulations"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-mid hover:text-navy transition-colors mb-6"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t('sim.backAll')}
        </Link>
      </div>

      <header className="px-4 lg:px-8 pb-10 border-b border-navy/8 relative overflow-hidden">
        <div
          className="absolute -top-20 right-0 w-[60vw] h-[40vh] opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(184,134,46,0.12), transparent 60%)', filter: 'blur(80px)' }}
          aria-hidden="true"
        />

        <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-lg bg-navy text-paper font-display text-2xl font-semibold flex items-center justify-center">
                {initial}
              </div>
              <div>
                <span className="h-eyebrow block mb-0.5">
                  {sim.creator?.company_name ? t('sim.from') : t('sim.original')}
                </span>
                {sim.creator?.company_name && (
                  <p className="font-display text-lg font-semibold text-ink">{sim.creator.company_name}</p>
                )}
              </div>
            </div>

            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-semibold text-balance mb-4">
              {localized.title}
            </h1>

            <p className="text-base lg:text-lg text-ink-mid max-w-2xl leading-relaxed mb-6">
              {localized.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag-neutral">
                <BarChart2 size={11} aria-hidden="true" />
                {localized.role_type}
              </span>
              <span className={getDifficultyClass(sim.difficulty)}>
                {t(diffKey)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-ink-mid bg-paper-deep border border-navy/10">
                <Clock size={11} aria-hidden="true" />
                {t('common.minutes', { n: sim.duration_minutes })}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-ink-mid bg-paper-deep border border-navy/10">
                <HelpCircle size={11} aria-hidden="true" />
                {t('sim.tasks', { n: questions.length })}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-verdigris bg-verdigris-wash border border-verdigris/25">
                <Trophy size={11} aria-hidden="true" />
                {t('sim.certified')}
              </span>
            </div>
          </div>

          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="card-dossier p-6">
              <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold mb-1">{t('landing.openAccess')}</p>
              <p className="font-display text-2xl font-semibold mb-4 leading-tight">
                {t('sim.startToday')}
              </p>
              <Link href={startHref} className="btn-primary w-full justify-center py-3.5 mb-3">
                <Play size={16} aria-hidden="true" />
                {t('sim.startThis')}
              </Link>
              <ul className="text-xs text-ink-mid space-y-1.5 mt-4">
                {[t('sim.selfPaced'), t('sim.oneSitting'), t('sim.aiScoring'), t('sim.certPassport')].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-navy shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </header>

      <div className="px-4 lg:px-8">
        <SimulationDetailTabs
          description={localized.description}
          durationMinutes={sim.duration_minutes}
          roleType={localized.role_type}
          questions={questions}
          companyName={sim.creator?.company_name || null}
          creatorName={sim.creator?.full_name || null}
        />
      </div>

      <div className="lg:hidden sticky bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur-sm border-t border-navy/10 px-4 py-3 mt-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">{t('landing.openAccess')}</p>
            <p className="text-sm font-semibold text-ink truncate">{localized.title}</p>
          </div>
          <Link href={startHref} className="btn-primary px-5 py-3 shrink-0">
            <Play size={14} aria-hidden="true" />
            {t('sim.launch')}
          </Link>
        </div>
      </div>

      <div className="px-4 lg:px-8 mt-12">
        <div className="card-feature p-8 lg:p-12 text-paper text-center">
          <div className="max-w-2xl mx-auto">
            <Building2 size={24} className="text-gold mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-3 leading-tight">
              {t('sim.readyTitle')}
            </h2>
            <p className="text-sm lg:text-base text-paper/80 mb-6 leading-relaxed">
              {t('sim.readyMeta', { n: questions.length, m: sim.duration_minutes })}
            </p>
            <Link
              href={startHref}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-deep text-navy-deep font-semibold px-7 py-3.5 rounded-md transition-colors group"
            >
              <Play size={16} aria-hidden="true" />
              {t('sim.startThis')}
              <span className="ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
