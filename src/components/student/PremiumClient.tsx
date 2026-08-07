'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock, Sparkles, Award, Users, Infinity, ArrowRight, Bell,
} from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'

interface PremiumClientProps {
  studentName: string
}

const UPCOMING = [
  { icon: Infinity, text: 'Sınırsız simulyasiya girişi' },
  { icon: Sparkles, text: 'Dərin AI analiz və geri-bildirim' },
  { icon: Award, text: 'Premium sertifikat və bacarıq pasportu' },
  { icon: Users, text: 'HR-lara birbaşa müraciət imkanı' },
]

export function PremiumClient({ studentName }: PremiumClientProps) {
  const firstName = studentName.split(' ')[0] || 'dostum'

  return (
    <div>
      <EditorialHero
        eyebrow="Premium"
        title={
          <>
            Tezliklə <span className="text-navy">aktivləşəcək</span>.
          </>
        }
        dek="Premium abunəlik hələ aktiv deyil. Hazırda bütün simulyasiyalar pulsuz açıqdır."
        meta={[
          { label: 'Status', value: 'Gözləmədə' },
          { label: 'Simulyasiyalar', value: 'Hamısı açıq' },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card-dossier p-8 lg:p-10 max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gold-wash border border-gold/30 text-gold-deep text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Clock size={12} aria-hidden="true" />
            Coming soon
          </span>
        </div>

        <h2 className="font-display text-2xl lg:text-3xl font-semibold text-ink mb-3">
          {firstName}, bu funksiya hələ aktiv deyil
        </h2>
        <p className="text-ink-mid text-sm lg:text-base leading-relaxed mb-6">
          Premium abunəlik yaxın zamanda aktivləşəcək. Bu arada bütün yayımlanmış
          simulyasiyalara limitsiz girişiniz var — heç bir ödəniş və ya promo kod tələb olunmur.
        </p>

        <div className="rounded-md border border-navy/10 bg-navy-wash/60 p-5 mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} className="text-navy" aria-hidden="true" />
            <p className="text-sm font-semibold text-navy">Planlaşdırılan imtiyazlar</p>
          </div>
          <ul className="space-y-2.5">
            {UPCOMING.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-mid">
                <Icon size={15} className="text-navy shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/student/simulations" className="btn-primary inline-flex justify-center">
            Simulyasiyalara keç
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href="/student/dashboard" className="btn-secondary inline-flex justify-center">
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
