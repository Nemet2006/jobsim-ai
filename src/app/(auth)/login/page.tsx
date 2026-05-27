'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'
import { AuroraBackground } from '@/components/ui/AuroraBackground'

const ROLE_REDIRECTS: Record<UserRole, string> = {
  student: '/student/dashboard',
  hr: '/hr/dashboard',
  courses: '/courses/dashboard',
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

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
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

      {/* Top nav */}
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
          <Link
            href="/register"
            className="text-sm font-medium text-ink-mid hover:text-forest"
          >
            Hesabınız yoxdur? <span className="text-forest underline-offset-2 hover:underline">Qeydiyyat</span>
          </Link>
        </div>
      </header>

      <main id="main" className="relative z-10 px-6 lg:px-8 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <span className="h-eyebrow-coral inline-block mb-5">Welcome back</span>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-semibold text-ink text-balance mb-5">
              Get noticed.<br />
              <span className="italic font-light text-forest">Get hired.</span>
            </h1>
            <p className="text-lg lg:text-xl text-ink-mid leading-relaxed max-w-lg mb-8 text-balance">
              Real iş simulyasiyaları ilə bacarıqlarını sübut et. AI qiymətləndirməsi, ekspert geri-bildirimi və sertifikat.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Real şirkət simulyasiyaları (bank, telekom, audit)',
                'AI qiymətləndirmə və bacarıq pasportu',
                'Universitet qrupu ilə inteqrasiya',
              ].map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={18} className="text-forest shrink-0" aria-hidden="true" />
                  <span className="text-base text-ink">{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          {/* Right: login card */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
            aria-label="Daxil olma forması"
          >
            <div className="card p-7 lg:p-9 max-w-md mx-auto lg:ml-auto lg:mr-0">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-2">
                Daxil ol<span className="text-coral">.</span>
              </h2>
              <p className="text-sm text-ink-mid mb-7">
                Davam etmək üçün hesabınıza qoşulun.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="polite"
                  className="mb-5 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-ink mb-2">
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="text-sm font-semibold text-ink">
                      Şifrə
                    </label>
                    <Link href="/login" className="text-xs font-medium text-forest hover:text-forest-deep">
                      Unutdunuz?
                    </Link>
                  </div>
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

                <button type="submit" disabled={loading} className="btn-coral w-full py-3.5 group">
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

              <div className="mt-7 pt-6 border-t border-forest/8 text-center">
                <p className="text-sm text-ink-mid">
                  Yeni gəlmisiniz?{' '}
                  <Link href="/register" className="font-semibold text-forest hover:text-forest-deep underline-offset-2 hover:underline">
                    Pulsuz hesab yaradın →
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-ink-mute">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
                100% pulsuz · Self-paced · Open-access
              </span>
            </p>
          </motion.aside>
        </div>
      </main>
    </div>
  )
}
