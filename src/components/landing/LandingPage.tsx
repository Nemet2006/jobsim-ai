import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Award, Briefcase, GraduationCap } from 'lucide-react'
import { VerificationSeal } from '@/components/ui/VerificationSeal'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { getT } from '@/i18n/get-locale'
import type { TFunction } from '@/i18n/translate'

function featureList(t: TFunction) {
  return [
    { icon: Shield, title: t('landing.f1Title'), text: t('landing.f1Text') },
    { icon: Award, title: t('landing.f2Title'), text: t('landing.f2Text') },
    { icon: Briefcase, title: t('landing.f3Title'), text: t('landing.f3Text') },
  ]
}

function stepList(t: TFunction) {
  return [
    { n: '01', title: t('landing.step1Title'), text: t('landing.step1Text') },
    { n: '02', title: t('landing.step2Title'), text: t('landing.step2Text') },
    { n: '03', title: t('landing.step3Title'), text: t('landing.step3Text') },
  ]
}

export default async function LandingPage() {
  const { t } = await getT()
  const FEATURES = featureList(t)
  const STEPS = stepList(t)

  return (
    <div className="min-h-screen relative">
      <AuroraBackground variant="auth" />

      <header className="relative z-10 px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5" aria-label="JobSim AI">
            <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" fill="#F6F3EC" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              JobSim<span className="text-gold-deep">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/simulations" className="hidden sm:inline text-sm font-medium text-ink-mid hover:text-navy">
              {t('public.navSimulations')}
            </Link>
            <Link href="/verify" className="hidden md:inline text-sm font-medium text-ink-mid hover:text-navy">
              {t('public.navVerify')}
            </Link>
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-ink-mid hover:text-navy whitespace-nowrap" prefetch>
              {t('common.login')}
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-3 sm:px-4 whitespace-nowrap" prefetch>
              {t('common.startFree')}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="relative z-10">
        <section className="px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <div className="animate-fade-up">
              <span className="h-eyebrow inline-block mb-5">{t('landing.eyebrow')}</span>
              <h1 className="h-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.02] mb-5 text-balance">
                {t('landing.h1a')}<br />
                <span className="text-navy">{t('landing.h1b')}</span>{' '}
                <span className="text-gold-deep">{t('landing.h1c')}</span>
              </h1>
              <p className="text-lg text-ink-mid leading-relaxed max-w-lg mb-8 text-balance">
                {t('landing.dek')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn-primary group" prefetch>
                  {t('common.createFreeAccount')}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link href="/simulations" className="btn-secondary" prefetch>
                  {t('public.exploreSims')}
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {[t('landing.perkFree'), t('landing.perkPace'), t('landing.perkAi')].map((label) => (
                  <li key={label} className="flex items-center gap-1.5 text-sm text-ink-mid">
                    <CheckCircle2 size={14} className="text-verdigris" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <aside
              className="card-dossier p-6 lg:p-7 max-w-sm mx-auto lg:ml-auto w-full animate-fade-up [animation-delay:120ms]"
              aria-label={t('landing.ledgerAria')}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="h-meta mb-1">{t('landing.ledgerKicker')}</p>
                  <p className="font-display text-lg font-semibold text-ink">{t('landing.dossier')}</p>
                </div>
                <VerificationSeal score={94} label="SCORE" size="md" variant="gold" />
              </div>
              <div className="space-y-0 divide-y divide-navy/8">
                {[
                  { k: t('landing.sim'), v: 'Data Analyst' },
                  { k: t('common.company'), v: 'Kapital Bank' },
                  { k: t('landing.certificate'), v: '#A2-13F' },
                  { k: t('common.status'), v: t('common.verified') },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink-mute">{row.k}</span>
                    <span className="font-mono font-medium text-ink tabular-nums">{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-navy/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-verdigris" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-verdigris">
                  {t('landing.openAccess')}
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-16 border-t border-navy/10 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <p className="h-eyebrow mb-3">{t('landing.process')}</p>
            <h2 className="h-display text-3xl lg:text-4xl mb-10">{t('landing.threeSteps')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <div
                  key={step.n}
                  className="card-dossier p-6 animate-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="font-mono text-2xl font-semibold text-gold-deep tabular-nums">{step.n}</span>
                  <h3 className="font-display text-xl font-semibold mt-3 mb-1.5 text-ink">{step.title}</h3>
                  <p className="text-sm text-ink-mid">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <p className="h-eyebrow mb-3">{t('landing.why')}</p>
            <h2 className="h-display text-3xl lg:text-4xl mb-10 max-w-xl text-balance">
              {t('landing.whyTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="p-1">
                    <div className="w-10 h-10 rounded-md bg-navy-wash flex items-center justify-center mb-4">
                      <Icon size={18} className="text-navy" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 text-ink">{f.title}</h3>
                    <p className="text-sm text-ink-mid leading-relaxed">{f.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-16 border-t border-navy/10 bg-navy text-paper">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, role: t('landing.audienceStudent'), text: t('landing.audienceStudentText') },
              { icon: Briefcase, role: t('landing.audienceHr'), text: t('landing.audienceHrText') },
              { icon: Award, role: t('landing.audienceCourses'), text: t('landing.audienceCoursesText') },
            ].map((a) => {
              const Icon = a.icon
              return (
                <div key={a.role}>
                  <Icon size={20} className="text-gold-soft mb-3" aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold mb-2 text-paper">{a.role}</h3>
                  <p className="text-sm text-paper/80 leading-relaxed">{a.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <VerificationSeal label="START" size="lg" variant="navy" className="mx-auto mb-6" />
            <h2 className="h-display text-3xl lg:text-4xl mb-4 text-balance">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-ink-mid mb-8 max-w-md mx-auto">
              {t('landing.ctaDek')}
            </p>
            <Link href="/register" className="btn-primary group text-base px-7 py-3" prefetch>
              {t('landing.ctaButton')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-navy/10 px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-sm font-semibold">
            JobSim<span className="text-gold-deep">.</span>
          </span>
          <div className="flex items-center gap-4 text-xs text-ink-mute">
            <Link href="/simulations" className="hover:text-navy">{t('public.navSimulations')}</Link>
            <Link href="/verify" className="hover:text-navy">{t('public.navVerify')}</Link>
            <span>© 2026 JobSim AI · Get noticed. Get hired.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
