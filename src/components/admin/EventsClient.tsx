'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'

interface EventRow {
  id: string
  event_name: string
  occurred_at: string
  user_id: string | null
  session_id: string | null
  role: string | null
  page_path: string | null
  referrer: string | null
  properties: Record<string, unknown>
}

interface EventsResponse {
  items: EventRow[]
  total: number
  page: number
  pageSize: number
  eventNames: string[]
}

const DAY_OPTIONS = [
  { value: 7, label: '7 gün' },
  { value: 30, label: '30 gün' },
  { value: 90, label: '90 gün' },
]

export default function EventsClient() {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [page, setPage] = useState(0)
  const [eventFilter, setEventFilter] = useState('')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), days: String(days) })
      if (eventFilter) params.set('event', eventFilter)
      const res = await fetch(`/api/analytics/events?${params}`, { cache: 'no-store' })
      const payload = await res.json()
      if (!res.ok) {
        setError(payload.error || 'Eventlər yüklənmədi')
        setData(null)
        return
      }
      setData(payload)
      setError(null)
    } catch {
      setError('Şəbəkə xətası')
    } finally {
      setLoading(false)
    }
  }, [page, eventFilter, days])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div>
      <EditorialHero
        eyebrow="Raw Events"
        title={
          <>
            Hadisə <span className="text-navy">axını</span>
          </>
        }
        dek="Platformada baş verən bütün izlənən hadisələr — PII saxlanılmır, yalnız anonim identifikatorlar."
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value)
            setPage(0)
          }}
          className="ed-input !w-auto text-sm"
          aria-label="Event filtri"
        >
          <option value="">Bütün eventlər</option>
          {(data?.eventNames ?? []).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {DAY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setDays(opt.value)
              setPage(0)
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              days === opt.value
                ? 'bg-navy text-paper border-navy'
                : 'bg-white text-ink-mid border-navy/12 hover:border-navy/30'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          onClick={load}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white border border-navy/12 text-ink-mid hover:border-navy/30"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Yenilə
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 px-4 py-3 bg-danger-tint border border-danger/25 text-danger text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="card-dossier overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-mute border-b border-navy/8">
              <th className="px-4 py-3">Vaxt</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Səhifə</th>
              <th className="px-4 py-3">İstifadəçi</th>
              <th className="px-4 py-3">Properties</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((row) => (
              <tr key={row.id} className="border-b border-navy/8 last:border-0 align-top">
                <td className="px-4 py-3 whitespace-nowrap text-ink-mid">
                  {new Date(row.occurred_at).toLocaleString('az-AZ')}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-navy-wash text-navy px-2 py-1 rounded-lg">
                    {row.event_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-mid">{row.role ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink truncate max-w-[180px]">
                  {row.page_path ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-[10px] text-ink-mute">
                  {row.user_id ? `${row.user_id.slice(0, 8)}…` : 'anonim'}
                </td>
                <td className="px-4 py-3 font-mono text-[10px] text-ink-mid max-w-[240px] truncate">
                  {row.properties && Object.keys(row.properties).length > 0
                    ? JSON.stringify(row.properties)
                    : '—'}
                </td>
              </tr>
            ))}
            {!loading && (data?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-mute">
                  Bu filtrlə event tapılmadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-5 text-sm text-ink-mid">
        <span>
          Cəmi <strong className="text-ink">{data?.total ?? 0}</strong> event · səhifə {page + 1}/{totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-navy/12 bg-white disabled:opacity-40"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Əvvəlki
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-navy/12 bg-white disabled:opacity-40"
          >
            Növbəti
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
