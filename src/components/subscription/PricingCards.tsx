'use client'

import { useState } from 'react'
import { Check, Clock, Loader2 } from 'lucide-react'
import { formatUsd, type SubscriptionPlan } from '@/lib/subscription-plans'
import { useT } from '@/i18n/I18nProvider'

interface PricingCardsProps {
  plans: SubscriptionPlan[]
  /** When provided, plan buttons start a real checkout instead of showing the preview notice. */
  onSelect?: (plan: SubscriptionPlan) => void
  busyPlanId?: string | null
}

export function PricingCards({ plans, onSelect, busyPlanId = null }: PricingCardsProps) {
  const { t } = useT()
  const [notice, setNotice] = useState<string | null>(null)

  function handleSelect(plan: SubscriptionPlan) {
    if (onSelect) {
      onSelect(plan)
      return
    }
    setNotice(t('common.displayOnly', { name: plan.name }))
  }

  return (
    <div>
      <div
        className={`grid gap-5 ${
          plans.length > 1 ? 'md:grid-cols-2 max-w-3xl' : 'max-w-md'
        }`}
      >
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.highlight
                ? 'relative rounded-2xl border-2 border-gold bg-white p-6 lg:p-7 shadow-soft-md'
                : 'relative rounded-2xl border border-navy/10 bg-white p-6 lg:p-7 shadow-sm'
            }
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-6 inline-flex items-center px-2.5 py-1 rounded-md bg-gold text-navy-deep text-[10px] font-semibold uppercase tracking-[0.14em]">
                {plan.savingsLabel || t('common.recommended')}
              </span>
            )}

            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-mute mb-2">
              {plan.audienceLabel}
            </p>
            <h3 className="font-display text-2xl font-semibold text-ink mb-4">{plan.name}</h3>

            <div className="mb-5">
              {plan.pricePrefix && (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep mb-1">
                  {plan.pricePrefix}
                </p>
              )}
              <p className="flex items-end gap-1.5">
                <span className="number-display text-4xl lg:text-5xl text-ink leading-none">
                  {formatUsd(plan.priceUsd)}
                </span>
                <span className="text-sm text-ink-mute pb-1">/ {plan.billedAs}</span>
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute mb-3">
              {t('common.whatYouGet')}
            </p>
            <ul className="space-y-2.5 mb-7">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-mid">
                  <Check
                    size={16}
                    className="text-verdigris shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSelect(plan)}
              disabled={busyPlanId !== null}
              className={
                plan.highlight
                  ? 'btn-gold w-full'
                  : 'btn-secondary w-full'
              }
            >
              {busyPlanId === plan.id && (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              )}
              {busyPlanId === plan.id ? t('premium.redirecting') : plan.cta}
            </button>
          </article>
        ))}
      </div>

      {notice && (
        <p
          role="status"
          className="mt-5 max-w-3xl rounded-xl border border-gold/30 bg-gold-wash px-4 py-3 text-sm text-ink-mid flex items-start gap-2"
        >
          <Clock size={15} className="text-gold-deep shrink-0 mt-0.5" aria-hidden="true" />
          {notice}
        </p>
      )}

      {!onSelect && (
        <p className="mt-4 text-xs text-ink-mute max-w-3xl">
          {t('common.comingSoonPay')}
        </p>
      )}
    </div>
  )
}
