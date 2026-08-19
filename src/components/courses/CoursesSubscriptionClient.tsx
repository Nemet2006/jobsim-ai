'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { getCoursesPlans } from '@/lib/subscription-plans'
import { useT } from '@/i18n/I18nProvider'

interface CoursesSubscriptionClientProps {
  instructorName: string
}

export function CoursesSubscriptionClient({ instructorName }: CoursesSubscriptionClientProps) {
  const { t } = useT()
  const firstName = instructorName.split(' ')[0] || t('nav.teacherBrand')

  return (
    <div>
      <EditorialHero
        eyebrow={t('nav.subscription')}
        title={
          <>
            {firstName} · <span className="text-navy">{t('pricing.coursesName')}</span>
          </>
        }
        dek={t('pricing.coursesF1')}
        meta={[
          { label: t('pricing.studentYearly'), value: '$2,499+' },
        ]}
      />

      <PricingCards plans={getCoursesPlans(t)} />

      <div className="mt-8">
        <Link href="/courses/groups" className="btn-secondary inline-flex">
          {t('nav.groups')}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
