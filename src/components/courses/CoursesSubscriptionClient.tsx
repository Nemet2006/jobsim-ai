'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { COURSES_PLANS } from '@/lib/subscription-plans'

interface CoursesSubscriptionClientProps {
  instructorName: string
}

export function CoursesSubscriptionClient({ instructorName }: CoursesSubscriptionClientProps) {
  const firstName = instructorName.split(' ')[0] || 'müəllim'

  return (
    <div>
      <EditorialHero
        eyebrow="Abunəlik"
        title={
          <>
            {firstName}, kampus planı <span className="text-navy">$2,499</span>-dan başlayır.
          </>
        }
        dek="Universitet və kurslar üçün illik lisenziya. Qruplar, tapşırıqlar, reytinq və tələbə–HR axını bir yerdə."
        meta={[
          { label: 'İllik', value: '$2,499+' },
        ]}
      />

      <PricingCards plans={COURSES_PLANS} showDemoNotice={false} />

      <div className="mt-8">
        <Link href="/courses/groups" className="btn-secondary inline-flex">
          Qruplara qayıt
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
