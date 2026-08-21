'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useT } from '@/i18n/I18nProvider'
import { isPlatformAdminEmail } from '@/lib/platform-admin'

export default function AdminLoginPage() {
  const { t } = useT()
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
    track('login_attempt', { source: 'admin' })

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      track('login_failed', { source: 'admin' })
      setError(t('auth.loginError'))
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

      if (profile?.role === 'admin' || isPlatformAdminEmail(user.email)) {
        if (isPlatformAdminEmail(user.email)) {
          await fetch('/api/auth/claim-platform-admin', { method: 'POST' }).catch(() => {})
        }
        track('login_success', { source: 'admin', role: 'admin' })
        router.push('/admin/dashboard')
        router.refresh()
        return
      }

      await supabase.auth.signOut()
      track('login_failed', { source: 'admin', role: profile?.role || 'none' })
      setError(t('auth.adminOnly'))
      setLoading(false)
      return
    }

    setError(t('auth.loginError'))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      <header className="px-6 lg:px-8 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="JobSim AI">
            <div className="w-8 h-8 rounded-lg bg-gold text-navy-deep flex items-center justify-center">
              <ShieldCheck size={16} aria-hidden="true" />
            </div>
            <span className="font-display font-semibold text-sm">
              JobSim AI <span className="text-white/45 font-normal">Admin</span>
            </span>
          </Link>
          <LanguageSwitcher className="border-white/15 bg-white/5 [&_button]:text-white/80" />
        </div>
      </header>

      <main id="main" className="flex-1 px-6 py-10 flex items-start justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121A2B] p-7 lg:p-8 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-gold mb-3">
            {t('auth.adminEyebrow')}
          </p>
          <h1 className="font-display text-3xl font-semibold mb-2">
            {t('auth.adminTitle')}
            <span className="text-gold">.</span>
          </h1>
          <p className="text-sm text-white/55 mb-6 leading-relaxed">
            {t('auth.adminHint')}
          </p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 px-3.5 py-2.5 rounded-md bg-red-500/10 border border-red-400/25 text-red-200 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold mb-1.5">
                {t('auth.email')}
              </label>
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="username"
                inputMode="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@…"
                required
                className="w-full rounded-md border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold mb-1.5">
                {t('auth.password')}
              </label>
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-md border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gold text-navy-deep font-semibold py-3 hover:bg-gold-deep disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t('auth.checking')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.adminSubmit')}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            <Link href="/" className="hover:text-gold underline-offset-2 hover:underline">
              {t('auth.adminBack')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
