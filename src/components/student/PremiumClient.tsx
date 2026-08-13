'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { PricingCards } from '@/components/subscription/PricingCards'
import { STUDENT_PLANS } from '@/lib/subscription-plans'

interface PremiumClientProps {
  studentName: string
}

export function PremiumClient({ studentName }: PremiumClientProps) {
  const firstName = studentName.split(' ')[0] || 'tələbə'

  return (
    <div>
      <EditorialHero
        eyebrow="Abunəlik"
        title={
          <>
            {firstName}, planını <span className="text-navy">seç</span>.
          </>
        }
        dek="Tələbə abunəliyi: aylıq $9.99 və ya illik $79.99. Limitsiz simulyasiya, AI feedback və rəsmi sertifikat."
        meta={[
          { label: 'Aylıq', value: '$9.99' },
          { label: 'İllik', value: '$79.99' },
        ]}
      />

      <PricingCards plans={STUDENT_PLANS} />

      <div className="mt-8">
        <Link href="/student/simulations" className="btn-secondary inline-flex">
          Simulyasiyalara keç
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
