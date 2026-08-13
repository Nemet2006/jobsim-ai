/** Display-only subscription catalog by audience. Checkout is not wired. */

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

export const STUDENT_PLANS: SubscriptionPlan[] = [
  {
    id: 'b2c-monthly',
    audience: 'b2c',
    name: 'Aylıq',
    audienceLabel: 'B2C · Tələbə',
    period: 'monthly',
    priceUsd: 9.99,
    billedAs: 'ayda',
    features: [
      'Limitsiz simulyasiya girişi',
      'Dərin AI feedback və analiz',
      'Rəsmi JobSim sertifikatı',
      'Bacarıq pasportu',
      'HR-lara görünmə',
      'Nəticələrin PDF yüklənməsi',
    ],
    cta: 'Aylıq abunə ol',
  },
  {
    id: 'b2c-yearly',
    audience: 'b2c',
    name: 'İllik',
    audienceLabel: 'B2C · Tələbə',
    period: 'yearly',
    priceUsd: 79.99,
    billedAs: 'ildə',
    highlight: true,
    savingsLabel: '2 ay pulsuz',
    features: [
      'Limitsiz simulyasiya girişi',
      'Dərin AI feedback və analiz',
      'Rəsmi JobSim sertifikatı',
      'Bacarıq pasportu',
      'HR-lara görünmə',
      'Nəticələrin PDF yüklənməsi',
      'Prioritet dəstək',
    ],
    cta: 'İllik abunə ol',
  },
]

export const HR_PLANS: SubscriptionPlan[] = [
  {
    id: 'b2b-yearly',
    audience: 'b2b',
    name: 'Company',
    audienceLabel: 'B2B · HR / Şirkət',
    period: 'yearly',
    priceUsd: 499,
    billedAs: 'ildə',
    highlight: true,
    features: [
      'Limitsiz simulyasiya yaratma və dərc',
      'Namizəd pipeline, shortlist və müqayisə',
      'Şirkət hesabatları və PDF export',
      'Komanda üzvləri üçün giriş',
      'Şirkət brendinqi',
      'Prioritet HR dəstəyi',
    ],
    cta: 'İllik planı seç',
  },
]

export const COURSES_PLANS: SubscriptionPlan[] = [
  {
    id: 'b2b2c-yearly',
    audience: 'b2b2c',
    name: 'Campus',
    audienceLabel: 'B2B2C · Universitet / Kurs',
    period: 'yearly',
    priceUsd: 2499,
    pricePrefix: 'başlayır',
    billedAs: 'ildə',
    highlight: true,
    features: [
      'Limitsiz tələbə qrupları və tapşırıqlar',
      'Reytinq, analitika və tərəqqi paneli',
      'Universitet / kampus brendinqi',
      'HR + akademik birgə axın',
      'Onboarding və müəllim təlimi',
      'Dedicated hesab meneceri',
    ],
    cta: 'Kampus planını seç',
  },
]

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
