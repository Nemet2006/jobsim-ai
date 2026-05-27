'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PremiumUpgradeButton } from '@/components/student/PremiumUpgradeButton'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Lock,
  X,
  SlidersHorizontal,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { getDifficultyLabel } from '@/lib/utils'
import type { Simulation, Difficulty } from '@/types'
import { SimCard } from '@/components/ui/SimCard'

interface SimulationsGridProps {
  simulations: (Simulation & { creator?: { full_name: string; company_name: string } | null })[]
  isPremium: boolean
  completionCounts?: Record<string, number>
}

import { FREE_SIMULATION_LIMIT } from '@/lib/simulation-access'

const FREE_LIMIT = FREE_SIMULATION_LIMIT

const QUICK_FILTERS = [
  { id: 'all',     label: 'Hamısı',       icon: null as React.ReactNode },
  { id: 'under60', label: 'Under 60 min', icon: <Clock size={12} aria-hidden="true" /> },
  { id: 'easy',    label: 'Yeni başlayanlar', icon: <Zap size={12} aria-hidden="true" /> },
] as const

type QuickFilterId = (typeof QUICK_FILTERS)[number]['id']

type SortKey = 'recent' | 'shortest' | 'easy_first' | 'hard_first'

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'recent',     label: 'Yenilər' },
  { id: 'shortest',   label: 'Qısa müddət' },
  { id: 'easy_first', label: 'Asandan çətinə' },
  { id: 'hard_first', label: 'Çətindən asana' },
]

export default function SimulationsGrid({ simulations, isPremium, completionCounts = {} }: SimulationsGridProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [quick, setQuick] = useState<QuickFilterId>('all')
  const [roles, setRoles] = useState<Set<string>>(new Set())
  const [companies, setCompanies] = useState<Set<string>>(new Set())
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set())
  const [sort, setSort] = useState<SortKey>('recent')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Derived facets
  const facets = useMemo(() => {
    const r = new Map<string, number>()
    const c = new Map<string, number>()
    const d = new Map<Difficulty, number>()
    simulations.forEach((s) => {
      if (s.role_type) r.set(s.role_type, (r.get(s.role_type) || 0) + 1)
      if (s.creator?.company_name) c.set(s.creator.company_name, (c.get(s.creator.company_name) || 0) + 1)
      d.set(s.difficulty, (d.get(s.difficulty) || 0) + 1)
    })
    return {
      roles: Array.from(r.entries()).sort((a, b) => b[1] - a[1]),
      companies: Array.from(c.entries()).sort((a, b) => b[1] - a[1]),
      difficulties: (['easy', 'medium', 'hard'] as Difficulty[]).map((k) => [k, d.get(k) || 0] as const),
    }
  }, [simulations])

  // Filtered + sorted list
  const list = useMemo(() => {
    let arr = simulations.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = `${s.title} ${s.description ?? ''} ${s.role_type ?? ''} ${s.creator?.company_name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (quick === 'under60' && s.duration_minutes > 60) return false
      if (quick === 'easy' && s.difficulty !== 'easy') return false
      if (roles.size > 0 && !roles.has(s.role_type)) return false
      if (difficulties.size > 0 && !difficulties.has(s.difficulty)) return false
      if (companies.size > 0 && (!s.creator?.company_name || !companies.has(s.creator.company_name))) return false
      return true
    })
    const diffOrder: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }
    arr = arr.sort((a, b) => {
      switch (sort) {
        case 'shortest':   return a.duration_minutes - b.duration_minutes
        case 'easy_first': return diffOrder[a.difficulty] - diffOrder[b.difficulty]
        case 'hard_first': return diffOrder[b.difficulty] - diffOrder[a.difficulty]
        case 'recent':
        default:           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    return arr
  }, [simulations, search, quick, roles, difficulties, companies, sort])

  const activeFilterCount =
    roles.size + companies.size + difficulties.size + (quick !== 'all' ? 1 : 0) + (search ? 1 : 0)

  function toggleSet<T>(set: Set<T>, item: T, setter: (s: Set<T>) => void) {
    const next = new Set(set)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    setter(next)
  }

  function clearAll() {
    setSearch('')
    setQuick('all')
    setRoles(new Set())
    setCompanies(new Set())
    setDifficulties(new Set())
  }

  return (
    <div className="relative">
      {/* ============ HERO ============ */}
      <header className="pb-8 mb-8 border-b border-forest/8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="h-eyebrow block mb-2">Simulyasiya kitabxanası</span>
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-semibold text-balance">
              İş simulyasiyaları və <span className="italic font-light text-forest">qısa kurslar</span>.
            </h1>
            <p className="mt-3 text-base lg:text-lg text-ink-mid max-w-2xl leading-relaxed">
              Bacarıqlarınızı qurmaq və recruiter-lər tərəfindən fərq edilmək üçün uyğun simulyasiyanı tapın.
            </p>
          </div>
          {!isPremium && (
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-coral-wash border border-coral/25 text-coral-deep text-sm font-medium">
              <Lock size={14} aria-hidden="true" />
              <span>{FREE_LIMIT} pulsuz / {simulations.length} ümumi</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirkət, rol, və ya bacarıq axtarın…"
            aria-label="Simulyasiya axtar"
            className="ed-input pl-11 pr-4 py-3 rounded-full"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-forest-wash flex items-center justify-center text-ink-mute hover:text-forest"
              aria-label="Axtarışı təmizlə"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quick filters */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <span className="h-meta mr-1">Sürətli filter:</span>
          {QUICK_FILTERS.map((q) => {
            const isActive = quick === q.id
            return (
              <button
                key={q.id}
                onClick={() => setQuick(q.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                  isActive
                    ? 'bg-forest text-cream border-forest'
                    : 'bg-white text-ink-mid border-forest/12 hover:border-forest/30 hover:text-forest'
                }`}
              >
                {q.icon}
                {q.label}
              </button>
            )
          })}

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-forest/12 text-forest"
            aria-label="Bütün filterləri aç"
          >
            <SlidersHorizontal size={12} aria-hidden="true" />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-coral text-white text-[9px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ============ MAIN GRID ============ */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-8">

        {/* SIDEBAR FILTER (desktop) */}
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 -mr-2" aria-label="Filterlər">
          <FilterPanel
            facets={facets}
            roles={roles}
            companies={companies}
            difficulties={difficulties}
            toggleRole={(r) => toggleSet(roles, r, setRoles)}
            toggleCompany={(c) => toggleSet(companies, c, setCompanies)}
            toggleDifficulty={(d) => toggleSet(difficulties, d, setDifficulties)}
            onClear={clearAll}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* GRID PANEL */}
        <section aria-label="Simulyasiya nəticələri">
          {/* Result bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-ink-mid">
              <span className="font-semibold text-ink">{list.length}</span>
              {' nəticə '}
              {simulations.length !== list.length && <span className="text-ink-mute">({simulations.length} ümumi)</span>}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs text-ink-mute uppercase tracking-wider font-semibold hidden sm:block">
                Sırala
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-sm font-medium bg-white border border-forest/12 rounded-full pl-4 pr-9 py-2 cursor-pointer hover:border-forest/30 focus:outline-none focus:border-forest/60"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active chips */}
          {activeFilterCount > 0 && (
            <div className="mb-5 flex items-center gap-2 flex-wrap">
              {Array.from(roles).map((r) => (
                <Chip key={`r-${r}`} label={r} onRemove={() => toggleSet(roles, r, setRoles)} />
              ))}
              {Array.from(companies).map((c) => (
                <Chip key={`c-${c}`} label={c} onRemove={() => toggleSet(companies, c, setCompanies)} />
              ))}
              {Array.from(difficulties).map((d) => (
                <Chip key={`d-${d}`} label={getDifficultyLabel(d)} onRemove={() => toggleSet(difficulties, d, setDifficulties)} />
              ))}
              <button onClick={clearAll} className="text-xs font-semibold text-coral-deep hover:text-coral underline-offset-2 hover:underline">
                Hamısını təmizlə
              </button>
            </div>
          )}

          {/* Grid */}
          {list.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {list.map((sim, idx) => {
                const isLocked = !isPremium && idx >= FREE_LIMIT
                if (isLocked) {
                  return (
                    <LockedCard
                      key={sim.id}
                      sim={sim}
                      onUpgrade={() => setShowUpgrade(true)}
                    />
                  )
                }
                return (
                  <SimCard
                    key={sim.id}
                    href={`/student/simulations/${sim.id}`}
                    title={sim.title}
                    company={sim.creator?.company_name || null}
                    category={sim.role_type}
                    difficulty={sim.difficulty}
                    duration={`${sim.duration_minutes} dəq`}
                    description={sim.description}
                    completions={completionCounts[sim.id]}
                    badge={!isPremium && idx < FREE_LIMIT ? 'Pulsuz' : undefined}
                    delay={Math.min(idx * 0.04, 0.4)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-wash flex items-center justify-center">
                <Search size={28} className="text-coral-deep" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Heç nə tapılmadı</h3>
              <p className="text-ink-mid text-sm mb-6 max-w-sm mx-auto">
                Filterlər çox dardır. Bir neçəsini silməyə cəhd edin.
              </p>
              <button onClick={clearAll} className="btn-secondary inline-flex">
                <X size={14} aria-hidden="true" />
                Filterləri təmizlə
              </button>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
              onClick={() => setMobileFilterOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-[340px] max-w-full bg-cream z-50 overflow-y-auto"
              aria-label="Filter paneli"
            >
              <div className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-forest/10 px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-forest" aria-hidden="true" />
                  <h2 className="font-display text-xl font-semibold">Filterlər</h2>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral text-white text-[10px] font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-forest-wash flex items-center justify-center"
                  aria-label="Bağla"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel
                  facets={facets}
                  roles={roles}
                  companies={companies}
                  difficulties={difficulties}
                  toggleRole={(r) => toggleSet(roles, r, setRoles)}
                  toggleCompany={(c) => toggleSet(companies, c, setCompanies)}
                  toggleDifficulty={(d) => toggleSet(difficulties, d, setDifficulties)}
                  onClear={clearAll}
                  activeCount={activeFilterCount}
                />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={clearAll} className="btn-secondary py-3">Təmizlə</button>
                  <button onClick={() => setMobileFilterOpen(false)} className="btn-coral py-3">
                    Göstər ({list.length})
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgrade && (
          <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={() => router.push('/student/dashboard')} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- FilterPanel ---------- */

function FilterPanel({
  facets,
  roles,
  companies,
  difficulties,
  toggleRole,
  toggleCompany,
  toggleDifficulty,
  onClear,
  activeCount,
}: {
  facets: {
    roles: [string, number][]
    companies: [string, number][]
    difficulties: readonly (readonly [Difficulty, number])[]
  }
  roles: Set<string>
  companies: Set<string>
  difficulties: Set<Difficulty>
  toggleRole: (r: string) => void
  toggleCompany: (c: string) => void
  toggleDifficulty: (d: Difficulty) => void
  onClear: () => void
  activeCount: number
}) {
  return (
    <div className="space-y-7">
      {/* Top */}
      <div className="hidden lg:flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Filterlər</h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs font-semibold text-coral-deep hover:text-coral">
            Təmizlə
          </button>
        )}
      </div>

      {/* Difficulty */}
      <FacetSection title="Çətinlik">
        {facets.difficulties.map(([d, count]) => (
          <FacetCheckbox
            key={d}
            label={getDifficultyLabel(d)}
            count={count}
            checked={difficulties.has(d)}
            onChange={() => toggleDifficulty(d)}
          />
        ))}
      </FacetSection>

      {/* Role */}
      {facets.roles.length > 0 && (
        <FacetSection title="Rol / Karyera">
          {facets.roles.slice(0, 10).map(([r, count]) => (
            <FacetCheckbox
              key={r}
              label={r}
              count={count}
              checked={roles.has(r)}
              onChange={() => toggleRole(r)}
            />
          ))}
        </FacetSection>
      )}

      {/* Company */}
      {facets.companies.length > 0 && (
        <FacetSection title="Şirkət">
          {facets.companies.slice(0, 10).map(([c, count]) => (
            <FacetCheckbox
              key={c}
              label={c}
              count={count}
              checked={companies.has(c)}
              onChange={() => toggleCompany(c)}
            />
          ))}
        </FacetSection>
      )}
    </div>
  )
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="h-eyebrow block mb-3">{title}</legend>
      <div className="space-y-1.5">{children}</div>
    </fieldset>
  )
}

function FacetCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className={`group flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer ${
      checked ? 'bg-forest-wash' : 'hover:bg-forest-wash/40'
    }`}>
      <div className={`relative shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
        checked ? 'bg-forest border-forest' : 'border-forest/30 bg-white group-hover:border-forest/60'
      }`}>
        {checked && <CheckCircle2 size={10} className="text-cream" strokeWidth={3} aria-hidden="true" />}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={label}
        />
      </div>
      <span className={`flex-1 text-sm ${checked ? 'text-forest font-semibold' : 'text-ink-mid group-hover:text-forest'}`}>
        {label}
      </span>
      <span className="text-xs text-ink-mute font-medium">{count}</span>
    </label>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium bg-forest-wash border border-forest/15 text-forest">
      {label}
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full hover:bg-forest/15 flex items-center justify-center"
        aria-label={`${label} filterini sil`}
      >
        <X size={10} aria-hidden="true" />
      </button>
    </span>
  )
}

/* ---------- Locked sim card ---------- */

function LockedCard({
  sim,
  onUpgrade,
}: {
  sim: Simulation & { creator?: { full_name: string; company_name: string } | null }
  onUpgrade: () => void
}) {
  return (
    <article className="relative card p-5 lg:p-6 h-full opacity-95 overflow-hidden">
      <div className="absolute inset-0 bg-cream/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center mb-3">
          <Lock size={18} aria-hidden="true" />
        </div>
        <p className="font-display text-lg font-semibold mb-1">Premium üçün</p>
        <p className="text-xs text-ink-mid mb-4 max-w-[200px]">
          Bu simulyasiyaya tam giriş üçün Premium-a keçin
        </p>
        <button onClick={onUpgrade} className="btn-coral text-xs py-2 px-4">
          Premium-a Keç
        </button>
      </div>
      {/* Greyed background content */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-forest/20 font-display text-lg font-semibold flex items-center justify-center text-forest">
          {(sim.creator?.company_name || sim.title)[0]?.toUpperCase()}
        </div>
        {sim.creator?.company_name && (
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-ink-mute font-semibold">From</p>
            <p className="text-sm font-semibold text-ink truncate">{sim.creator.company_name}</p>
          </div>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-2 leading-tight">{sim.title}</h3>
      <p className="text-sm text-ink-mid line-clamp-2 mb-4">{sim.description}</p>
    </article>
  )
}

/* ---------- Upgrade modal ---------- */

function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="card-feature p-8 max-w-md w-full text-cream pointer-events-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-cream/10 flex items-center justify-center text-cream/70 hover:text-cream"
            aria-label="Bağla"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-coral flex items-center justify-center mb-5">
            <Zap size={22} className="text-white" fill="currentColor" aria-hidden="true" />
          </div>
          <h2 id="upgrade-title" className="font-display text-3xl font-semibold mb-2">
            Premium-a <span className="italic text-sun">keç.</span>
          </h2>
          <p className="text-sm text-cream/80 mb-6 leading-relaxed">
            Bütün simulyasiyalara limitsiz giriş, dərin AI analiz, və sertifikat.
          </p>
          <ul className="space-y-2.5 mb-7">
            {['Sınırsız simulyasiyalar', 'Dərin AI analiz', 'Premium sertifikat', 'HR-a birbaşa müraciət'].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 size={16} className="text-sun shrink-0" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="btn-secondary border-cream/20 bg-transparent text-cream hover:bg-cream/10">
              İndi yox
            </button>
            <Link href="/student/premium" className="btn-coral w-full justify-center">
              Premium Al
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}
