'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Briefcase, GraduationCap, Loader2, Users, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import type { UserRole } from '@/types'
import { AuroraBackground } from '@/components/ui/AuroraBackground'

const ROLE_OPTIONS: {
  value: UserRole
  label: string
  description: string
  icon: typeof GraduationCap
  tag: string
}[] = [
  {
    value: 'student',
    label: 'Tələbə / İş axtaran',
    description: 'Pulsuz simulyasiyalar keç, bacarıqlarını sübut et',
    icon: GraduationCap,
    tag: '',
  },
  {
    value: 'hr',
    label: 'HR / Şirkət',
    description: 'Simulyasiyalar yarat, ən yaxşı namizədləri tap',
    icon: Briefcase,
    tag: '',
  },
  {
    value: 'courses',
    label: 'Kurs / Müəllim',
    description: 'Tələbələrin tərəqqisini analitika ilə izlə',
    icon: Users,
    tag: '',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [university, setUniversity] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    track('register_attempt', { role })

    if (password.length < 8) {
      setError('Şifrə ən az 8 simvol olmalıdır')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName,
        role,
        university: role === 'student' ? university : null,
        companyName: role === 'hr' ? companyName : null,
        inviteCode: role !== 'student' ? inviteCode : undefined,
      }),
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      track('register_failed', { role })
      setError(payload.error || 'Qeydiyyat uğursuz oldu')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Hesab yaradıldı, lakin giriş uğursuz oldu. Login səhifəsindən cəhd edin.')
      setLoading(false)
      return
    }

    const redirects: Record<UserRole, string> = {
      student: '/student/dashboard',
      hr: '/hr/dashboard',
      courses: '/courses/dashboard',
      admin: '/admin/dashboard',
    }
    router.push(redirects[role])
    router.refresh()
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground variant="auth" />

      <header className="relative z-10 px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="JobSim AI">
            <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#FAF5EC" />
              </svg>
            </div>
            <span className="font-display text-2xl font-semibold">
              JobSim<span className="text-coral">.</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-ink-mid hover:text-forest">
            Hesabınız var? <span className="text-forest underline-offset-2 hover:underline">Daxil ol</span>
          </Link>
        </div>
      </header>

      <main id="main" className="relative z-10 px-6 lg:px-8 py-10 lg:py-14">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10"
          >
            <span className="h-eyebrow-coral inline-block mb-4">Pulsuz başlayın</span>
            <h1 className="font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-semibold text-balance mb-4">
              Karyera hekayəniz<br />
              <span className="italic font-light text-forest">bu gün başlayır.</span>
            </h1>
            <p className="text-lg text-ink-mid leading-relaxed max-w-xl mx-auto text-balance">
              30 saniyəyə hesab yaradın. Self-paced, 100% pulsuz, açıq giriş.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="card p-7 lg:p-10"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                aria-live="polite"
                className="mb-6 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">

              {/* Role */}
              <fieldset>
                <legend className="block text-sm font-semibold text-ink mb-3">
                  Sizə uyğun rol
                </legend>
                <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Rolunuzu seçin">
                  {ROLE_OPTIONS.map((option, idx) => {
                    const Icon = option.icon
                    const isActive = role === option.value
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => {
                          setRole(option.value)
                          setInviteCode('')
                          track('register_role_selected', { role: option.value })
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.06 }}
                        className={`relative text-left p-4 rounded-2xl border-2 touch-manipulation focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                          isActive
                            ? 'border-forest bg-forest-wash'
                            : 'border-forest/10 bg-white hover:border-forest/30 hover:bg-forest-wash/40'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-forest text-cream' : 'bg-forest-wash text-forest'
                          }`}>
                            <Icon size={18} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`font-semibold text-sm ${isActive ? 'text-forest' : 'text-ink'}`}>
                                {option.label}
                              </p>
                              {option.tag && <span className="tag-coral text-[10px] py-0">{option.tag}</span>}
                            </div>
                            <p className="text-xs text-ink-mid">{option.description}</p>
                          </div>
                          {isActive && (
                            <CheckCircle2 size={20} className="text-forest shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </fieldset>

              {/* Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-ink mb-2">Ad Soyad</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                  className="ed-input"
                />
              </div>

              <AnimatePresence mode="wait">
                {role === 'student' && (
                  <motion.div
                    key="uni"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <label htmlFor="university" className="block text-sm font-semibold text-ink mb-2">
                      Universitet <span className="text-ink-mute font-normal">· Opsional</span>
                    </label>
                    <input
                      id="university"
                      type="text"
                      autoComplete="organization"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Bakı Dövlət Universiteti"
                      className="ed-input"
                    />
                  </motion.div>
                )}

                {role === 'hr' && (
                  <motion.div
                    key="co"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-ink mb-2">Şirkət adı</label>
                      <input
                        id="company"
                        type="text"
                        autoComplete="organization"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Şirkətinizin adı"
                        required
                        className="ed-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="inviteCode" className="block text-sm font-semibold text-ink mb-2">HR dəvət kodu</label>
                      <input
                        id="inviteCode"
                        type="password"
                        autoComplete="off"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Daxili dəvət kodu"
                        required
                        className="ed-input"
                      />
                    </div>
                  </motion.div>
                )}

                {role === 'courses' && (
                  <motion.div
                    key="courses-invite"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <label htmlFor="coursesInviteCode" className="block text-sm font-semibold text-ink mb-2">Müəllim dəvət kodu</label>
                    <input
                      id="coursesInviteCode"
                      type="password"
                      autoComplete="off"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Daxili dəvət kodu"
                      required
                      className="ed-input"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="siz@example.com"
                    required
                    className="ed-input"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-ink mb-2">
                    Şifrə <span className="text-ink-mute font-normal">· min 8</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="ed-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-coral w-full py-3.5 group">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Hesab yaradılır…</span>
                  </>
                ) : (
                  <>
                    <span>Pulsuz hesab yarat</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="text-xs text-ink-mute text-center pt-2">
                Hesab yaradaraq{' '}
                <Link href="/login" className="underline-offset-2 hover:underline">İstifadə Şərtləri</Link>
                {' '}ilə razılaşırsınız
              </p>
            </form>
          </motion.div>

          <p className="mt-6 text-center text-sm text-ink-mid">
            Hesabınız var?{' '}
            <Link href="/login" className="font-semibold text-forest hover:text-forest-deep underline-offset-2 hover:underline">
              Daxil ol →
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
