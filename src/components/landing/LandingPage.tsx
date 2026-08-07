'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Shield, Award, Briefcase, GraduationCap } from 'lucide-react'
import { VerificationSeal } from '@/components/ui/VerificationSeal'
import { AuroraBackground } from '@/components/ui/AuroraBackground'

const FEATURES = [
  {
    icon: Shield,
    title: 'Sübut edilmiş bacarıq',
    text: 'AI ilə qiymətləndirilən real iş simulyasiyaları — CV-dəki iddiaların yerinə konkret nəticə.',
  },
  {
    icon: Award,
    title: 'Rəsmi sertifikat',
    text: 'Hər tamamlanmış simulyasiya üçün verification seal və bacarıq pasportu.',
  },
  {
    icon: Briefcase,
    title: 'HR-lər sizi tapır',
    text: 'Nəticələriniz şirkətlərin shortlist-inə düşür — birbaşa müraciət etmədən görünürsünüz.',
  },
]

const STEPS = [
  { n: '01', title: 'Hesab yaradın', text: '30 saniyəyə pulsuz qeydiyyat' },
  { n: '02', title: 'Simulyasiya keçin', text: 'Real şirkət tapşırıqları, AI qiymətləndirmə' },
  { n: '03', title: 'Sertifikat alın', text: 'Verification seal + skill passport' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <AuroraBackground variant="auth" />

      <header className="relative z-10 px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="JobSim AI">
            <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" fill="#F6F3EC" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              JobSim<span className="text-gold">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-ink-mid hover:text-navy">
              Daxil ol
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Pulsuz başla
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="relative z-10">
        {/* Hero */}
        <section className="px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="h-eyebrow inline-block mb-5">Bacarıq sertifikatlaşdırması</span>
              <h1 className="h-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.02] mb-5 text-balance">
                Sübut et.<br />
                <span className="text-navy">Görün.</span>{' '}
                <span className="text-gold-deep">İşə düz.</span>
              </h1>
              <p className="text-lg text-ink-mid leading-relaxed max-w-lg mb-8 text-balance">
                Real iş simulyasiyaları, AI qiymətləndirmə və verification seal —
                CV-ni deyil, bacarığını göstər.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn-primary group">
                  Pulsuz hesab yarat
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link href="/login" className="btn-secondary">
                  Artıq hesabım var
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['100% pulsuz başlanğıc', 'Self-paced', 'AI-powered'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-sm text-ink-mid">
                    <CheckCircle2 size={14} className="text-verdigris" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Ledger card — signature visual */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="card-dossier p-6 lg:p-7 max-w-sm mx-auto lg:ml-auto w-full"
              aria-label="Nümunə verification ledger"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="h-meta mb-1">Verification ledger</p>
                  <p className="font-display text-lg font-semibold text-ink">Namizəd dossier</p>
                </div>
                <VerificationSeal score={94} label="SCORE" size="md" variant="gold" />
              </div>
              <div className="space-y-0 divide-y divide-navy/8">
                {[
                  { k: 'Simulyasiya', v: 'Data Analyst' },
                  { k: 'Şirkət', v: 'Kapital Bank' },
                  { k: 'Sertifikat', v: '#A2-13F' },
                  { k: 'Status', v: 'VERIFIED' },
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
                  Premium aktiv
                </span>
              </div>
            </motion.aside>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 lg:px-8 py-16 border-t border-navy/10 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <p className="h-eyebrow mb-3">Proses</p>
            <h2 className="h-display text-3xl lg:text-4xl mb-10">Üç addımda işə hazırlıq</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="card-dossier p-6"
                >
                  <span className="font-mono text-2xl font-semibold text-gold-deep tabular-nums">{step.n}</span>
                  <h3 className="font-display text-xl font-semibold mt-3 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-ink-mid">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <p className="h-eyebrow mb-3">Niyə JobSim</p>
            <h2 className="h-display text-3xl lg:text-4xl mb-10 max-w-xl text-balance">
              CV əvəzinə sübut
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="p-1"
                  >
                    <div className="w-10 h-10 rounded-md bg-navy-wash flex items-center justify-center mb-4">
                      <Icon size={18} className="text-navy" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-ink-mid leading-relaxed">{f.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Audiences */}
        <section className="px-6 lg:px-8 py-16 border-t border-navy/10 bg-navy text-paper">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, role: 'Tələbə', text: 'Simulyasiya keç, sertifikat al, HR-lərə görün.' },
              { icon: Briefcase, role: 'HR / Şirkət', text: 'Namizədləri bal və bacarıqla müqayisə et.' },
              { icon: Award, role: 'Kurs / Müəllim', text: 'Qrup yarat, tapşırıq ver, liderbord izlə.' },
            ].map((a) => {
              const Icon = a.icon
              return (
                <div key={a.role}>
                  <Icon size={20} className="text-gold-deep mb-3" aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold mb-2">{a.role}</h3>
                  <p className="text-sm text-paper/75 leading-relaxed">{a.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <VerificationSeal label="START" size="lg" variant="navy" className="mx-auto mb-6" />
            <h2 className="h-display text-3xl lg:text-4xl mb-4 text-balance">
              Karyera hekayəniz bu gün başlayır
            </h2>
            <p className="text-ink-mid mb-8 max-w-md mx-auto">
              Pulsuz hesab yaradın. İlk iki simulyasiya limitsiz, AI qiymətləndirmə dərhal.
            </p>
            <Link href="/register" className="btn-primary group text-base px-7 py-3">
              İndi qeydiyyatdan keç
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-navy/10 px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-sm font-semibold">
            JobSim<span className="text-gold">.</span>
          </span>
          <p className="text-xs text-ink-mute">© 2026 JobSim AI · Get noticed. Get hired.</p>
        </div>
      </footer>
    </div>
  )
}
