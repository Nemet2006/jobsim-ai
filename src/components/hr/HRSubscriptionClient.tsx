'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { getHrPlans } from '@/lib/subscription-plans'
import { useT } from '@/i18n/I18nProvider'

interface HRSubscriptionClientProps {
  companyName: string
}

export function HRSubscriptionClient({ companyName }: HRSubscriptionClientProps) {
  const { t } = useT()
  return (
    <div>
      <EditorialHero
        eyebrow={t('nav.subscription')}
        title={
          <>
            {companyName} · <span className="text-navy">{t('pricing.hrName')}</span>
          </>
        }
        dek={t('pricing.hrF2')}
        meta={[
          { label: t('pricing.studentYearly'), value: '$499' },
        ]}
      />

      <PricingCards plans={getHrPlans(t)} />

      <div className="mt-8">
        <Link href="/hr/simulations" className="btn-secondary inline-flex">
          {t('nav.simulations')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
