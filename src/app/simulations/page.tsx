import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Building2, Clock, ListChecks, Users } from 'lucide-react'
import { PublicShell } from '@/components/layout/PublicShell'
import { getT } from '@/i18n/get-locale'
import { listPublicSimulations } from '@/lib/public-data'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT()
  return {
    title: `${t('public.catalogTitle')} ${t('public.catalogTitleAccent')}`,
    description: t('public.catalogDek'),
    alternates: { canonical: '/simulations' },
  }
}

const DIFFICULTY_CLS = {
  easy: 'bg-verdigris/10 text-verdigris',
  medium: 'bg-gold/15 text-gold-deep',
  hard: 'bg-navy/10 text-navy',
} as const

export default async function PublicSimulationsPage() {
  const { locale, t } = await getT()
  const sims = await listPublicSimulations(locale)
  const totalCompleted = sims.reduce((sum, s) => sum + s.completions, 0)
  const companies = new Set(sims.map((s) => s.companyName).filter(Boolean)).size

  return (
    <PublicShell>
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-14">
        <div className="max-w-6xl mx-auto">
          <span className="h-eyebrow inline-block mb-4">{t('public.catalogEyebrow')}</span>
          <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] mb-4 text-balance max-w-3xl">
            {t('public.catalogTitle')}{' '}
            <span className="text-gold-deep">{t('public.catalogTitleAccent')}</span>
          </h1>
          <p className="text-lg text-ink-mid leading-relaxed max-w-2xl mb-8">{t('public.catalogDek')}</p>

          <dl className="grid grid-cols-3 gap-3 max-w-xl">
            {[
              { label: t('public.statSims'), value: sims.length },
              { label: t('public.statCompleted'), value: totalCompleted },
              { label: t('public.statCompanies'), value: companies },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-navy/10 bg-white/70 px-4 py-3">
                <dt className="text-[10px] uppercase tracking-[0.14em] font-semibold text-ink-mute">{s.label}</dt>
                <dd className="number-display text-2xl text-ink mt-1 tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {sims.length === 0 ? (
            <p className="card-dossier p-10 text-center text-ink-mid">{t('public.emptyCatalog')}</p>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sims.map((sim) => (
                <li key={sim.id}>
                  <Link
                    href={`/simulations/${sim.id}`}
                    className="card-dossier p-5 h-full flex flex-col group hover:shadow-soft-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute min-w-0">
                        <Building2 size={13} aria-hidden="true" className="shrink-0" />
                        <span className="truncate">{sim.companyName || t('sim.original')}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${DIFFICULTY_CLS[sim.difficulty]}`}
                      >
                        {t(`sim.${sim.difficulty}`)}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-semibold text-ink leading-snug mb-1 group-hover:text-navy">
                      {sim.title}
                    </h2>
                    <p className="text-xs font-medium text-gold-deep mb-2">{sim.roleType}</p>
                    <p className="text-sm text-ink-mid line-clamp-3 mb-4 flex-1">{sim.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-mute">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} aria-hidden="true" />
                        {t('common.minutes', { n: sim.durationMinutes })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ListChecks size={12} aria-hidden="true" />
                        {t('sim.questions', { n: sim.questionCount })}
                      </span>
                      {sim.completions > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users size={12} aria-hidden="true" />
                          {t('public.completions', { n: sim.completions })}
                        </span>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                      {t('public.viewDetails')}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicShell>
  )
}
