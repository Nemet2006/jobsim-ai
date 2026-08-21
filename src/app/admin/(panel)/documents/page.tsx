export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Award, ExternalLink, FileText } from 'lucide-react'
import { IMPACT_ACHIEVEMENTS, IMPACT_DOCUMENTS } from '@/lib/admin-impact-data'

export default function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-mute mb-1">
            Documents
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Nailiyyətlər & sənədlər
          </h1>
        </div>
        <Link href="/admin/dashboard#documents" className="text-sm font-semibold text-navy">
          Impact report →
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {IMPACT_ACHIEVEMENTS.map((a) => (
          <div
            key={a.title}
            className="rounded-2xl bg-white border border-navy/8 p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-14 h-14 bg-gold/15 rounded-bl-[2rem]" />
            <Award className="text-gold mb-3" size={20} aria-hidden="true" />
            <p className="font-display font-semibold text-ink">{a.title}</p>
            <p className="text-xs text-ink-mute mt-1">{a.subtitle}</p>
            <p className="text-[11px] font-semibold text-navy mt-3">{a.year}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 divide-y divide-navy/8">
        {IMPACT_DOCUMENTS.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={16} className="text-navy shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{d.label}</p>
                <p className="text-xs text-ink-mute truncate">{d.value}</p>
              </div>
            </div>
            {d.kind === 'link' && d.value.startsWith('http') ? (
              <a
                href={d.value}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-navy inline-flex items-center gap-1"
              >
                Aç <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : d.kind === 'link' ? (
              <Link href={d.value} className="text-xs font-semibold text-navy">
                Keç
              </Link>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
                File
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
