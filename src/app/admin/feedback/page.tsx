export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { IMPACT_FEEDBACK } from '@/lib/admin-impact-data'

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-mute mb-1">
            Feedback
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">İstifadəçi rəyləri</h1>
        </div>
        <Link href="/admin/dashboard#feedback" className="text-sm font-semibold text-navy">
          Impact report →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-navy/8 p-5">
          <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
            Responses
          </p>
          <p className="number-display text-4xl text-ink mt-2">{IMPACT_FEEDBACK.responses}</p>
        </div>
        <div className="rounded-2xl bg-white border border-navy/8 p-5">
          <p className="text-[10px] uppercase tracking-wider text-ink-mute font-semibold">
            Avg rating
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold">
            <Star size={20} className="text-gold fill-gold" aria-hidden="true" />
            {IMPACT_FEEDBACK.avgRating}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 p-5">
        <p className="text-sm font-semibold text-ink mb-1">
          Tövsiyə: {IMPACT_FEEDBACK.recommendYes}% Bəli
        </p>
        <div className="h-3 rounded-full bg-paper-deep overflow-hidden mt-3">
          <div
            className="h-full bg-verdigris rounded-full"
            style={{ width: `${IMPACT_FEEDBACK.recommendYes}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-navy/8 p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold">
            Ən çox bəyənilən
          </p>
          {IMPACT_FEEDBACK.liked.map((q) => (
            <blockquote
              key={`${q.author}-${q.date}`}
              className="text-sm text-ink-mid border-l-2 border-gold pl-3"
            >
              <p className="leading-relaxed">“{q.text}”</p>
              <footer className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-mute">
                <span className="font-semibold text-ink-mid">{q.author}</span>
                <span>·</span>
                <span>{q.role}</span>
                <span>·</span>
                <span>{q.date}</span>
                <span className="inline-flex items-center gap-0.5 text-gold">
                  <Star size={10} className="fill-gold" aria-hidden="true" />
                  {q.rating}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-navy/8 p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-ink-mute font-semibold">
            Təkliflər
          </p>
          {IMPACT_FEEDBACK.suggestions.map((q) => (
            <blockquote
              key={`${q.author}-${q.date}`}
              className="text-sm text-ink-mid border-l-2 border-navy/20 pl-3"
            >
              <p className="leading-relaxed">“{q.text}”</p>
              <footer className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-mute">
                <span className="font-semibold text-ink-mid">{q.author}</span>
                <span>·</span>
                <span>{q.role}</span>
                <span>·</span>
                <span>{q.date}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  )
}
