'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { track } from '@/lib/analytics-client'

/** Sends visitors to signup; after signup (or if already logged in) they land on this simulation. */
export function StartSimulationCta({ simulationId, label }: { simulationId: string; label: string }) {
  const next = `/student/simulations/${simulationId}`
  return (
    <Link
      href={`/register?next=${encodeURIComponent(next)}`}
      onClick={() => track('public_sim_cta_click', { simulation_id: simulationId })}
      className="btn-primary w-full justify-center group"
    >
      {label}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}
