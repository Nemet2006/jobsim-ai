'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Loader2, Ticket } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { getStudentPlans, type SubscriptionPlan } from '@/lib/subscription-plans'
import { track } from '@/lib/analytics-client'
import { useT } from '@/i18n/I18nProvider'

interface PremiumClientProps {
  studentName: string
  premiumEnabled: boolean
  isPremium: boolean
  /** Stripe Checkout session returned on ?success=1&session_id=… */
  checkoutSessionId: string | null
  checkoutCancelled: boolean
}

type Status = { kind: 'ok' | 'error' | 'info'; text: string } | null

export function PremiumClient({
  studentName,
  premiumEnabled,
  isPremium,
  checkoutSessionId,
  checkoutCancelled,
}: PremiumClientProps) {
  const { t } = useT()
  const router = useRouter()
  const firstName = studentName.split(' ')[0] || t('student.studentFallback')
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null)
  const [promo, setPromo] = useState('')
  const [promoBusy, setPromoBusy] = useState(false)
  const [status, setStatus] = useState<Status>(
    isPremium ? { kind: 'ok', text: t('premium.alreadyPremium') } : null
  )
  const confirmedRef = useRef(false)

  // Returning from Stripe: confirm the session so access is granted without waiting for the webhook.
  useEffect(() => {
    if (!premiumEnabled || confirmedRef.current) return
    if (checkoutCancelled) {
      confirmedRef.current = true
      track('premium_checkout_cancelled')
      setStatus({ kind: 'info', text: t('premium.cancelled') })
      return
    }
    if (!checkoutSessionId) return
    confirmedRef.current = true
    setStatus({ kind: 'info', text: t('premium.confirming') })
    fetch('/api/premium/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: checkoutSessionId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || t('premium.checkoutError'))
        setStatus({ kind: 'ok', text: t('premium.paidOk') })
        router.replace('/student/premium')
        router.refresh()
      })
      .catch((err: Error) => setStatus({ kind: 'error', text: err.message }))
  }, [premiumEnabled, checkoutSessionId, checkoutCancelled, router, t])

  async function startCheckout(plan: SubscriptionPlan) {
    setBusyPlanId(plan.id)
    setStatus(null)
    track('premium_checkout_started', { plan: plan.id })
    try {
      const res = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.period }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) throw new Error(data.error || t('premium.checkoutError'))
      window.location.assign(data.url)
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : t('premium.checkoutError') })
      setBusyPlanId(null)
    }
  }

  async function redeemPromo(e: React.FormEvent) {
    e.preventDefault()
    if (!promo.trim()) return
    setPromoBusy(true)
    setStatus(null)
    track('premium_promo_submitted')
    try {
      const res = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('premium.checkoutError'))
      setStatus({ kind: 'ok', text: data.already ? t('premium.alreadyPremium') : t('premium.promoOk') })
      setPromo('')
      router.refresh()
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : t('premium.checkoutError') })
    } finally {
      setPromoBusy(false)
    }
  }

  const statusCls = {
    ok: 'border-verdigris/30 bg-verdigris/10 text-verdigris',
    error: 'border-red-300 bg-red-50 text-red-800',
    info: 'border-gold/30 bg-gold-wash text-ink-mid',
  }

  return (
    <div>
      <EditorialHero
        eyebrow={t('student.premiumEyebrow')}
        title={
          <>
            {firstName}, planını <span className="text-navy">seç</span>.
          </>
        }
        dek={t('student.premiumDek')}
        meta={[
          { label: t('pricing.studentMonthly'), value: '$9.99' },
          { label: t('pricing.studentYearly'), value: '$79.99' },
        ]}
      />

      {status && (
        <p
          role={status.kind === 'error' ? 'alert' : 'status'}
          className={`mb-6 max-w-3xl rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${statusCls[status.kind]}`}
        >
          {status.kind === 'ok' && <CheckCircle2 size={16} className="shrink-0 mt-0.5" aria-hidden="true" />}
          {status.text}
        </p>
      )}

      <PricingCards
        plans={getStudentPlans(t)}
        onSelect={premiumEnabled && !isPremium ? startCheckout : undefined}
        busyPlanId={busyPlanId}
      />

      {premiumEnabled && !isPremium && (
        <form onSubmit={redeemPromo} className="mt-8 max-w-3xl rounded-2xl border border-navy/10 bg-white p-5">
          <label htmlFor="promo" className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
            <Ticket size={16} className="text-gold-deep" aria-hidden="true" />
            {t('premium.promoTitle')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="promo"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder={t('premium.promoPh')}
              maxLength={64}
              autoComplete="off"
              className="flex-1 rounded-md border border-navy/15 px-4 py-2.5 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
            <button type="submit" disabled={promoBusy || !promo.trim()} className="btn-primary justify-center">
              {promoBusy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
              {t('premium.promoApply')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8">
        <Link href="/student/simulations" className="btn-secondary inline-flex">
          {t('nav.simulations')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
