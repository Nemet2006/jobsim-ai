/** Display-only subscription catalog by audience. Checkout is not wired. */

import type { TFunction } from '@/i18n/translate'

export type PlanAudience = 'b2c' | 'b2b' | 'b2b2c'
export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionPlan {
  id: string
  audience: PlanAudience
  name: string
  audienceLabel: string
  period: BillingPeriod
  priceUsd: number
  /** e.g. "başlayır" for starting-from prices */
  pricePrefix?: string
  billedAs: string
  highlight?: boolean
  savingsLabel?: string
  features: string[]
  cta: string
}

export function getStudentPlans(t: TFunction): SubscriptionPlan[] {
  const features = [
    t('pricing.studentF1'),
    t('pricing.studentF2'),
    t('pricing.studentF3'),
    t('pricing.studentF4'),
    t('pricing.studentF5'),
    t('pricing.studentF6'),
  ]
  return [
    {
      id: 'b2c-monthly',
      audience: 'b2c',
      name: t('pricing.studentMonthly'),
      audienceLabel: t('pricing.studentAudience'),
      period: 'monthly',
      priceUsd: 9.99,
      billedAs: t('pricing.billedMonth'),
      features,
      cta: t('pricing.studentCtaMonth'),
    },
    {
      id: 'b2c-yearly',
      audience: 'b2c',
      name: t('pricing.studentYearly'),
      audienceLabel: t('pricing.studentAudience'),
      period: 'yearly',
      priceUsd: 79.99,
      billedAs: t('pricing.billedYear'),
      highlight: true,
      savingsLabel: t('pricing.twoMonthsFree'),
      features: [...features, t('pricing.studentF7')],
      cta: t('pricing.studentCtaYear'),
    },
  ]
}

export function getHrPlans(t: TFunction): SubscriptionPlan[] {
  return [
    {
      id: 'b2b-yearly',
      audience: 'b2b',
      name: t('pricing.hrName'),
      audienceLabel: t('pricing.hrAudience'),
      period: 'yearly',
      priceUsd: 499,
      billedAs: t('pricing.billedYear'),
      highlight: true,
      features: [
        t('pricing.hrF1'),
        t('pricing.hrF2'),
        t('pricing.hrF3'),
        t('pricing.hrF4'),
        t('pricing.hrF5'),
        t('pricing.hrF6'),
      ],
      cta: t('pricing.hrCta'),
    },
  ]
}

export function getCoursesPlans(t: TFunction): SubscriptionPlan[] {
  return [
    {
      id: 'b2b2c-yearly',
      audience: 'b2b2c',
      name: t('pricing.coursesName'),
      audienceLabel: t('pricing.coursesAudience'),
      period: 'yearly',
      priceUsd: 2499,
      pricePrefix: t('pricing.coursesPrefix'),
      billedAs: t('pricing.billedYear'),
      highlight: true,
      features: [
        t('pricing.coursesF1'),
        t('pricing.coursesF2'),
        t('pricing.coursesF3'),
        t('pricing.coursesF4'),
        t('pricing.coursesF5'),
        t('pricing.coursesF6'),
      ],
      cta: t('pricing.coursesCta'),
    },
  ]
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
