'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import type { UserRole } from '@/types'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { VerificationSeal } from '@/components/ui/VerificationSeal'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  student: '/student/dashboard',
  hr: '/hr/dashboard',
  courses: '/courses/dashboard',
  admin: '/admin/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    track('login_attempt')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      track('login_failed')
      setError('Email və ya şifrə yanlışdır')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        track('login_success', { role: profile.role })
        router.push(ROLE_REDIRECTS[profile.role as UserRole])
        router.refresh()
        return
      }
    }

    router.push('/login')
    setLoading(false)
  }

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
            <span className="font-display text-xl font-semibold">
              JobSim<span className="text-gold">.</span>
            </span>
          </Link>
          <Link href="/register" className="text-sm font-medium text-ink-mid hover:text-navy">
            Hesabınız yoxdur? <span className="text-navy underline-offset-2 hover:underline">Qeydiyyat</span>
          </Link>
        </div>
      </header>

      <main id="main" className="relative z-10 px-6 lg:px-8 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <span className="h-eyebrow-gold inline-block mb-4">Welcome back</span>
            <h1 className="h-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] mb-5 text-balance">
              Sübut et.<br />
              <span className="text-navy">Görün.</span>{' '}
              <span className="text-gold">İşə düz.</span>
            </h1>
            <p className="text-base lg:text-lg text-ink-mid leading-relaxed max-w-md mb-7">
              Real iş simulyasiyaları ilə bacarıqlarını sübut et. AI qiymətləndirməsi, sertifikat və verification seal.
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                'Real şirkət simulyasiyaları',
                'AI qiymətləndirmə və bacarıq pasportu',
                'Universitet qrupu ilə inteqrasiya',
              ].map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.07 }}
                  className="flex items-center gap-2.5"
                >
                  <CheckCircle2 size={16} className="text-verdigris shrink-0" aria-hidden="true" />
                  <span className="text-sm text-ink">{text}</span>
                </motion.li>
              ))}
            </ul>
            <VerificationSeal score={94} label="SCORE" size="sm" variant="gold" />
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
            aria-label="Daxil olma forması"
          >
            <div className="card-dossier p-7 lg:p-8 max-w-md mx-auto lg:ml-auto lg:mr-0">
              <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-1.5">
                Daxil ol<span className="text-gold">.</span>
              </h2>
              <p className="text-sm text-ink-mid mb-6">
                Davam etmək üçün hesabınıza qoşulun.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="polite"
                  className="mb-5 px-3.5 py-2.5 bg-danger-tint border border-danger/25 text-danger text-sm rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
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
                  <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
                    Şifrə
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="ed-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 group">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Yoxlanılır…</span>
                    </>
                  ) : (
                    <>
                      <span>Daxil ol</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-navy/10 text-center">
                <p className="text-sm text-ink-mid">
                  Yeni gəlmisiniz?{' '}
                  <Link href="/register" className="font-semibold text-navy hover:underline underline-offset-2">
                    Pulsuz hesab yaradın →
                  </Link>
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  )
}
