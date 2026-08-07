'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap, CheckCircle2, Loader2, CreditCard, Hash, ArrowRight,
  Infinity, Sparkles, Award, Users,
} from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { track } from '@/lib/analytics-client'

interface PremiumClientProps {
  isPremium: boolean
  stripeEnabled: boolean
  promoEnabled: boolean
  studentName: string
}

const FEATURES = [
  { icon: Infinity, text: 'Sınırsız simulyasiya girişi' },
  { icon: Sparkles, text: 'Dərin AI analiz və geri-bildirim' },
  { icon: Award, text: 'Premium sertifikat və bacarıq pasportu' },
  { icon: Users, text: 'HR-lara birbaşa müraciət imkanı' },
]

export function PremiumClient({ isPremium, stripeEnabled, promoEnabled, studentName }: PremiumClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Track cancelled Stripe checkout returns
  useEffect(() => {
    if (searchParams.get('cancelled') === '1') {
      track('premium_checkout_cancelled', { provider: 'stripe' })
    }
  }, [searchParams])

  // Handle Stripe redirect success
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const isSuccess = searchParams.get('success') === '1'

    if (!isSuccess || !sessionId || isPremium) return

    setConfirming(true)
    fetch('/api/premium/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSuccess(true)
          startTransition(() => router.refresh())
        } else {
          setError(data.error || 'Ödəniş təsdiqlənmədi')
        }
      })
      .catch(() => setError('Xəta baş verdi'))
      .finally(() => setConfirming(false))
  }, [searchParams, isPremium, router, startTransition])

  async function handleCheckout() {
    setCheckoutLoading(true)
    setError(null)
    track('premium_checkout_started', { provider: 'stripe' })
    try {
      const res = await fetch('/api/premium/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Checkout uğursuz')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Şəbəkə xətası')
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handlePromo(e: React.FormEvent) {
    e.preventDefault()
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setError(null)
    track('premium_promo_submitted', { provider: 'promo' })
    try {
      const res = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Promo kod yanlışdır')
        return
      }
      setSuccess(true)
      startTransition(() => router.refresh())
    } catch {
      setError('Xəta baş verdi')
    } finally {
      setPromoLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="card p-16 text-center max-w-lg mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-navy mx-auto mb-4" aria-hidden="true" />
        <p className="font-display text-xl font-semibold text-ink">Ödəniş təsdiqlənir…</p>
        <p className="text-sm text-ink-mid mt-2">Bir neçə saniyə gözləyin</p>
      </div>
    )
  }

  if (isPremium || success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-feature p-10 lg:p-14 text-paper text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 rounded-xl bg-gold flex items-center justify-center mx-auto mb-6">
          <Zap size={36} fill="currentColor" aria-hidden="true" />
        </div>
        <span className="h-eyebrow text-sun block mb-3">Premium Aktiv</span>
        <h2 className="font-display text-4xl font-semibold mb-3">
          {studentName.split(' ')[0]}, siz <span className="italic text-sun">Premium</span>siniz!
        </h2>
        <p className="text-paper/80 mb-8 leading-relaxed">
          Bütün simulyasiyalara limitsiz giriş, dərin AI analiz və sertifikat imkanlarınız aktivdir.
        </p>
        <Link href="/student/simulations" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-deep text-white font-medium px-7 py-3.5 rounded-md transition-colors">
          Simulyasiyalara keç
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </motion.div>
    )
  }

  return (
    <div>
      <EditorialHero
        eyebrow="Premium"
        title={
          <>
            Sübut et.<br />
            <span className="text-navy">Görün.</span>{' '}
            <span className="text-gold">Premium</span> ilə.
          </>
        }
        dek="Sınırsız simulyasiya, dərin AI analiz və verification seal — karyeranızı sürətləndirin."
      />

      {searchParams.get('cancelled') === '1' && (
        <div className="mb-6 px-4 py-3 bg-gold-wash border border-gold/25 text-gold-deep text-sm rounded-xl">
          Ödəniş ləğv edildi. İstədiyiniz vaxt yenidən cəhd edə bilərsiniz.
        </div>
      )}

      {searchParams.get('locked') === '1' && (
        <div className="mb-6 px-4 py-3 bg-gold-wash border border-gold/25 text-gold-deep text-sm rounded-xl">
          Bu simulyasiya Premium üzvlər üçündür. Promo kod və ya ödəniş ilə aktivləşdirin.
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Pricing card */}
        <div className="card-feature p-8 lg:p-10 text-paper">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={20} className="text-sun" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wider text-sun">Premium Plan</span>
          </div>

          <div className="mb-6">
            <p className="font-display text-5xl font-semibold leading-none">
              $9<span className="text-2xl text-paper/70">.99</span>
            </p>
            <p className="text-sm text-paper/70 mt-2">Birdəfəlik · bütün imtiyazlar</p>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-paper/90">
                <CheckCircle2 size={16} className="text-sun shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          {stripeEnabled ? (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-deep disabled:opacity-60 text-white font-semibold px-6 py-4 rounded-md transition-colors"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard size={18} aria-hidden="true" />
              )}
              Kartla ödə və aktivləşdir
            </button>
          ) : (
            <p className="text-sm text-paper/70 text-center py-2">
              Online ödəniş tezliklə aktiv olacaq. Aşağıdakı promo kodu istifadə edin.
            </p>
          )}
        </div>

        {/* Promo + Free comparison */}
        <div className="space-y-6">
          {promoEnabled && (
            <div className="card p-7">
              <div className="flex items-center gap-2 mb-4">
                <Hash size={18} className="text-navy" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold text-ink">Promo kod ilə aktivləşdir</h3>
              </div>
              <p className="text-sm text-ink-mid mb-5">
                Promo kodunuz varsa daxil edin — dərhal Premium aktiv olacaq.
              </p>
              <form onSubmit={handlePromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO KOD"
                  className="ed-input flex-1 font-mono uppercase tracking-wider"
                  aria-label="Promo kod"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoCode.trim()}
                  className="btn-primary px-5 shrink-0 disabled:opacity-50"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aktiv et'}
                </button>
              </form>
            </div>
          )}

          <div className="card p-7">
            <h3 className="font-display text-lg font-semibold text-ink mb-4">Free vs Premium</h3>
            <div className="space-y-3 text-sm">
              {[
                { f: 'Simulyasiya sayı', free: '2 pulsuz', pro: 'Sınırsız' },
                { f: 'AI analiz', free: 'Əsas', pro: 'Dərin' },
                { f: 'Sertifikat', free: '—', pro: '✓' },
                { f: 'HR müraciət', free: '—', pro: '✓' },
              ].map((row) => (
                <div key={row.f} className="grid grid-cols-3 gap-2 py-2 border-b border-forest/8 last:border-0">
                  <span className="text-ink-mid font-medium">{row.f}</span>
                  <span className="text-ink-mute text-center">{row.free}</span>
                  <span className="text-navy font-semibold text-center">{row.pro}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
