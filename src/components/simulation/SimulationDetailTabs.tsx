'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Building2,
  GraduationCap,
  Trophy,
  Video,
  Maximize2,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Target,
} from 'lucide-react'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import type { Question } from '@/types'
import { questionTypeLabel } from '@/lib/answers'

interface Props {
  description: string
  durationMinutes: number
  roleType: string
  questions: Question[]
  companyName: string | null
  creatorName: string | null
}

export function SimulationDetailTabs({
  description,
  durationMinutes,
  roleType,
  questions,
  companyName,
  creatorName,
}: Props) {
  const skillsForRole: string[] = (() => {
    const r = roleType.toLowerCase()
    if (r.includes('marketing')) return ['Brend kommunikasiyası', 'Sosial media analitikası', 'Campaign brief', 'Yazılı kommunikasiya', 'Yaradıcılıq']
    if (r.includes('data'))      return ['SQL əsasları', 'Məlumat təmizliyi', 'Vizual analiz', 'Hipoteza testi', 'Tabular düşüncə']
    if (r.includes('software') || r.includes('full stack') || r.includes('mobile') || r.includes('backend'))
      return ['Algoritmik düşüncə', 'Clean code', 'Git workflow', 'API dizaynı', 'Debugging']
    if (r.includes('devops') || r.includes('cloud'))
      return ['CI/CD', 'Container & K8s', 'Monitoring', 'Incident response', 'Infrastructure as Code']
    if (r.includes('cyber') || r.includes('security'))
      return ['SIEM triage', 'Threat analysis', 'Phishing response', 'Vulnerability mgmt', 'Security awareness']
    if (r.includes('quality') || r.includes('qa'))
      return ['Test planlaşdırma', 'Automation', 'Regression testing', 'Bug reporting', 'Edge case düşüncəsi']
    if (r.includes('it support') || r.includes('support'))
      return ['Ticket idarəetməsi', 'Troubleshooting', 'SLA prioritet', 'İstifadəçi kommunikasiyası', 'Documentation']
    if (r.includes('sales'))     return ['Aktiv dinləmə', 'Etiraz aradan qaldırma', 'Pipeline idarəsi', 'Empatiya', 'Kommunikasiya']
    if (r.includes('hr'))        return ['Müsahibə texnikası', 'Onboarding axını', 'Konflikt həlli', 'Yazışma', 'Mədəniyyət təhlili']
    return ['Tənqidi düşüncə', 'Strukturlu cavab', 'Yazılı kommunikasiya', 'Vaxt idarəsi', 'Detal-yönəlik']
  })()

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Ümumi baxış',
      icon: <Lightbulb size={14} aria-hidden="true" />,
      content: (
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Section title="Bu simulyasiya nədir?" eyebrow="Konteks">
              <p className="text-base lg:text-lg text-ink-mid leading-relaxed">{description}</p>
            </Section>

            <Section title="Nə edəcəksiniz" eyebrow="Tapşırıqlar" icon={<ClipboardList size={14} aria-hidden="true" />}>
              <ul className="space-y-3">
                {questions.slice(0, 8).map((q, i) => (
                  <li key={q.id} className="flex items-start gap-3 p-4 rounded-2xl bg-cream-paper border border-forest/8">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-forest text-cream font-display text-sm font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-ink leading-relaxed">{q.question}</p>
                  </li>
                ))}
                {questions.length > 8 && (
                  <li className="text-xs text-ink-mute font-medium pl-10">
                    +{questions.length - 8} daha tapşırıq · Hamısını &quot;Tapşırıqlar&quot; tabında görün
                  </li>
                )}
              </ul>
            </Section>

            <Section title="Nə öyrənəcəksiniz" eyebrow="Bacarıqlar" icon={<Sparkles size={14} aria-hidden="true" />}>
              <div className="flex flex-wrap gap-2">
                {skillsForRole.map((s) => (
                  <span key={s} className="tag-forest">
                    <CheckCircle2 size={11} aria-hidden="true" />
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          </div>

          {/* Right rail */}
          <aside className="space-y-5" aria-label="Simulyasiya detalları">
            <FeatureCard
              icon={<Trophy size={18} aria-hidden="true" />}
              eyebrow="Tamamlandıqda"
              title="JobSim sertifikatı"
              body="Profilinizə əlavə edilir və HR-lara avtomatik göndərilir."
            />
            <FeatureCard
              icon={<Target size={18} aria-hidden="true" />}
              eyebrow="Format"
              title="Self-paced & pulsuz"
              body="İstədiyiniz vaxt başlayın. Pauza olmur — bir oturuşda tamamlayın."
            />
            {(companyName || creatorName) && (
              <FeatureCard
                icon={<Building2 size={18} aria-hidden="true" />}
                eyebrow="Müəllif"
                title={companyName || creatorName || ''}
                body="Bu simulyasiya real iş senariləri əsasında qurulub."
              />
            )}
          </aside>
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tapşırıqlar',
      count: questions.length,
      icon: <ClipboardList size={14} aria-hidden="true" />,
      content: (
        <div className="max-w-3xl">
          <header className="mb-6">
            <span className="h-eyebrow block mb-2">Bütün tapşırıqlar</span>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-2">
              {questions.length} tapşırıq · təxminən{' '}
              <span className="italic font-light text-forest">{durationMinutes} dəq</span>
            </h2>
            <p className="text-sm text-ink-mid">
              Hər tapşırıq müstəqil qiymətləndirilir. Cavablarınız AI tərəfindən analiz olunur.
            </p>
          </header>
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="card p-5 lg:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-forest-wash text-forest font-display font-semibold flex items-center justify-center">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="tag-neutral">
                        {questionTypeLabel(q.type)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                        Tapşırıq {i + 1}
                      </span>
                    </div>
                    <p className="font-display text-lg lg:text-xl font-semibold text-ink leading-snug mb-1">
                      {q.question}
                    </p>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-forest/8">
                        <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold mb-2">
                          Variantlar (preview)
                        </p>
                        <ul className="space-y-1.5">
                          {q.options.map((o, oi) => (
                            <li key={oi} className="text-sm text-ink-mid flex items-start gap-2">
                              <span className="text-ink-mute font-mono text-xs mt-0.5 shrink-0">
                                {String.fromCharCode(65 + oi)}.
                              </span>
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      id: 'skills',
      label: 'Bacarıqlar',
      count: skillsForRole.length,
      icon: <Sparkles size={14} aria-hidden="true" />,
      content: (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <header className="mb-6">
              <span className="h-eyebrow block mb-2">Bacarıq pasportu</span>
              <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-2">
                Bu simulyasiyada{' '}
                <span className="italic font-light text-forest">inkişaf etdirəcəksiniz</span>
              </h2>
              <p className="text-sm text-ink-mid">
                Hər bacarıq AI tərəfindən qiymətləndirilir və pasportunuza əlavə olunur.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-3">
              {skillsForRole.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="card p-5 group hover:shadow-soft-md hover:border-forest/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sun-wash text-sun-deep flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles size={16} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink text-sm leading-snug mb-1">{s}</h3>
                      <p className="text-xs text-ink-mute">Real tapşırıqlarda sübut olunur</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <aside>
            <div className="card-feature-light p-6">
              <GraduationCap size={20} className="text-coral mb-3" aria-hidden="true" />
              <h3 className="font-display text-2xl font-semibold mb-2 leading-tight">
                Bacarıq <span className="italic font-light text-forest">sübutu</span>.
              </h3>
              <p className="text-sm text-ink-mid leading-relaxed">
                CV-də &ldquo;komanda işi&rdquo; yazmaq asandır. JobSim onu real tapşırıqda göstərməyə imkan verir.
              </p>
            </div>
          </aside>
        </div>
      ),
    },
    {
      id: 'rules',
      label: 'Qaydalar',
      icon: <ShieldCheck size={14} aria-hidden="true" />,
      content: (
        <div className="max-w-3xl space-y-5">
          <header className="mb-2">
            <span className="h-eyebrow block mb-2">Proctoring</span>
            <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-2">
              Ədalətli qiymətləndirmə üçün <span className="italic font-light text-forest">qaydalar</span>
            </h2>
            <p className="text-sm text-ink-mid">
              JobSim AI hər bir simulyasiyanı şəffaf və ədalətli izləyir — bu, sizin sertifikatınızın dəyərini qoruyur.
            </p>
          </header>

          <Rule
            icon={<Video size={18} aria-hidden="true" />}
            tone="info"
            title="Kamera girişi tələb olunur"
            body="AI sadəcə davranış nümunəsini izləyir — heç bir video saxlanılmır."
          />
          <Rule
            icon={<Maximize2 size={18} aria-hidden="true" />}
            tone="info"
            title="Tam ekran rejimi"
            body="Brauzer pəncərəsini kiçiltməyin. Tam ekrandan çıxsanız xəbərdarlıq alacaqsınız."
          />
          <Rule
            icon={<AlertTriangle size={18} aria-hidden="true" />}
            tone="warn"
            title="3 xəbərdarlıqdan sonra ləğv"
            body="Ekrandan çıxma, fokus itirmə, və ya yeni tab açma 3 dəfədən çox təkrarlansa, simulyasiya ləğv edilir."
          />
          <Rule
            icon={<CheckCircle2 size={18} aria-hidden="true" />}
            tone="success"
            title="Tamamlandıqda dərhal AI analiz"
            body={`${durationMinutes} dəqiqə tamamlandıqdan sonra dərin analiz, bal, və bacarıq pasportu yenilənməsi.`}
          />
        </div>
      ),
    },
  ]

  return <Tabs items={tabs} sticky />
}

/* ---------- Helpers ---------- */

function Section({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string
  eyebrow?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-forest" aria-hidden="true">{icon}</span>}
          <span className="h-eyebrow">{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-4 text-balance">{title}</h2>
      {children}
    </section>
  )
}

function FeatureCard({
  icon,
  eyebrow,
  title,
  body,
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-forest-wash text-forest flex items-center justify-center">
          {icon}
        </div>
        <span className="h-eyebrow">{eyebrow}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink mb-1 leading-tight">{title}</h3>
      <p className="text-sm text-ink-mid leading-relaxed">{body}</p>
    </div>
  )
}

function Rule({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode
  tone: 'info' | 'warn' | 'success'
  title: string
  body: string
}) {
  const config = {
    info:    { bg: 'bg-info-tint',    text: 'text-info',     border: 'border-info/20' },
    warn:    { bg: 'bg-coral-wash',   text: 'text-coral-deep', border: 'border-coral/20' },
    success: { bg: 'bg-success-tint', text: 'text-success',  border: 'border-success/20' },
  }[tone]

  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl bg-white border ${config.border}`}>
      <div className={`shrink-0 w-11 h-11 rounded-xl ${config.bg} ${config.text} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-ink text-sm lg:text-base mb-1">{title}</h3>
        <p className="text-sm text-ink-mid leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
