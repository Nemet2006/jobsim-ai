import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Award, BarChart3, Building2, CheckCircle2, Clock, ListChecks, ShieldCheck, Users } from 'lucide-react'
import { PublicShell } from '@/components/layout/PublicShell'
import { StartSimulationCta } from '@/components/landing/StartSimulationCta'
import { getT } from '@/i18n/get-locale'
import { getPublicSimulation } from '@/lib/public-data'
import type { QuestionType } from '@/types'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const { locale } = await getT()
  const sim = await getPublicSimulation(id, locale)
  if (!sim) return { title: 'JobSim AI', robots: { index: false } }
  const title = sim.companyName ? `${sim.title} — ${sim.companyName}` : sim.title
  return {
    title,
    description: sim.description.slice(0, 160),
    alternates: { canonical: `/simulations/${sim.id}` },
    openGraph: { title, description: sim.description.slice(0, 200), type: 'website' },
  }
}

const TYPE_KEYS: Record<QuestionType, string> = {
  open_ended: 'public.typeOpen',
  multiple_choice: 'public.typeChoice',
  code: 'public.typeCode',
  file_upload: 'public.typeFile',
}

export default async function PublicSimulationPage({ params }: { params: Params }) {
  const { id } = await params
  const { locale, t } = await getT()
  const sim = await getPublicSimulation(id, locale)
  if (!sim) notFound()

  const mix = (Object.keys(TYPE_KEYS) as QuestionType[]).filter((k) => sim.taskMix[k])

  return (
    <PublicShell>
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <Link href="/simulations" className="inline-flex items-center gap-1.5 text-sm text-ink-mid hover:text-navy mb-6">
            <ArrowLeft size={14} aria-hidden="true" />
            {t('public.backToCatalog')}
          </Link>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm text-ink-mute mb-3">
                <Building2 size={14} aria-hidden="true" />
                {sim.companyName || t('sim.original')}
              </p>
              <h1 className="h-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] mb-2 text-balance">{sim.title}</h1>
              <p className="text-base font-medium text-gold-deep mb-6">{sim.roleType}</p>

              <h2 className="font-display text-xl font-semibold text-ink mb-2">{t('public.whatYouDo')}</h2>
              <p className="text-ink-mid leading-relaxed whitespace-pre-line mb-8">{sim.description}</p>

              {mix.length > 0 && (
                <>
                  <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('public.taskMix')}</h2>
                  <ul className="flex flex-wrap gap-2 mb-8">
                    {mix.map((k) => (
                      <li key={k} className="rounded-md border border-navy/10 bg-white px-3 py-1.5 text-sm text-ink-mid">
                        {t(TYPE_KEYS[k])} · <span className="font-semibold text-ink tabular-nums">{sim.taskMix[k]}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h2 className="font-display text-xl font-semibold text-ink mb-3">{t('public.youGet')}</h2>
              <ul className="space-y-2.5">
                {[
                  { icon: BarChart3, text: t('public.getScore') },
                  { icon: Award, text: t('public.getCert') },
                  { icon: ShieldCheck, text: t('public.getPassport') },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm text-ink-mid">
                    <Icon size={16} className="text-verdigris shrink-0 mt-0.5" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="card-dossier p-6 lg:sticky lg:top-6">
              <ul className="divide-y divide-navy/8 text-sm mb-6">
                {[
                  { icon: Clock, k: t('common.minutes', { n: sim.durationMinutes }) },
                  { icon: ListChecks, k: t('sim.questions', { n: sim.questionCount }) },
                  { icon: CheckCircle2, k: t(`sim.${sim.difficulty}`) },
                  ...(sim.completions > 0
                    ? [{ icon: Users, k: t('public.completions', { n: sim.completions }) }]
                    : []),
                ].map(({ icon: Icon, k }) => (
                  <li key={k} className="flex items-center gap-2.5 py-2.5 text-ink">
                    <Icon size={15} className="text-navy" aria-hidden="true" />
                    {k}
                  </li>
                ))}
              </ul>
              <StartSimulationCta simulationId={sim.id} label={t('public.startNow')} />
              <p className="text-xs text-ink-mute text-center mt-3">{t('public.startFreeHint')}</p>
            </aside>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
