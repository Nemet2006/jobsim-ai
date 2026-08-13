'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { HR_PLANS } from '@/lib/subscription-plans'

interface HRSubscriptionClientProps {
  companyName: string
}

export function HRSubscriptionClient({ companyName }: HRSubscriptionClientProps) {
  return (
    <div>
      <EditorialHero
        eyebrow="Abunəlik · B2B"
        title={
          <>
            {companyName} üçün <span className="text-navy">Company</span> planı.
          </>
        }
        dek="HR / şirkət abunəliyi illik $499. Namizəd pipeline, shortlist, müqayisə və hesabatlar — bir komanda lisenziyasında."
        meta={[
          { label: 'İllik', value: '$499' },
          { label: 'Auditoriya', value: 'B2B' },
        ]}
      />

      <PricingCards plans={HR_PLANS} />

      <div className="mt-8">
        <Link href="/hr/simulations" className="btn-secondary inline-flex">
          Simulyasiyalara qayıt
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
