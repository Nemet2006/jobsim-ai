'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { getStudentPlans } from '@/lib/subscription-plans'
import { useT } from '@/i18n/I18nProvider'

interface PremiumClientProps {
  studentName: string
}

export function PremiumClient({ studentName }: PremiumClientProps) {
  const { t } = useT()
  const firstName = studentName.split(' ')[0] || t('student.studentFallback')

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

      <PricingCards plans={getStudentPlans(t)} />

      <div className="mt-8">
        <Link href="/student/simulations" className="btn-secondary inline-flex">
          {t('nav.simulations')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
