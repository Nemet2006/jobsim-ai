'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import type { User } from '@/types'
import {
  LayoutDashboard,
  Users,
  PlaySquare,
  MessageSquareText,
  Activity,
  FileStack,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useT } from '@/i18n/I18nProvider'

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface AdminShellProps {
  children: React.ReactNode
  user: User
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const { t } = useT()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const NAV: AdminNavItem[] = [
    { href: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/users', label: t('nav.users'), icon: Users },
    { href: '/admin/simulations', label: t('nav.simulations'), icon: PlaySquare },
    { href: '/admin/feedback', label: t('nav.feedback'), icon: MessageSquareText },
    { href: '/admin/events', label: t('nav.events'), icon: Activity },
    { href: '/admin/documents', label: t('nav.documents'), icon: FileStack },
  ]

  async function handleLogout() {
    track('logout', { section: 'PLATFORM ADMIN' })
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
            <nav className="flex flex-col gap-1 px-3" aria-label={t('nav.adminNav')}>
      {NAV.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              track('nav_click', { href: item.href, label: item.label })
              onNavigate?.()
            }}
            className={`inline-flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-white/12 text-white'
                : 'text-white/65 hover:text-white hover:bg-white/8'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#EEF1F5] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#16283D] text-white">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold text-navy-deep flex items-center justify-center">
              <ShieldCheck size={16} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm leading-tight">JobSim AI</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">Admin Panel</p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-4">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-sm font-semibold flex items-center justify-center">
              {user.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name || 'Admin'}</p>
              <p className="text-[11px] text-white/45 truncate">{user.email}</p>
            </div>
          </div>
            <LanguageSwitcher className="mb-3 w-full justify-center border-white/15 bg-white/5 [&_button]:text-white/80" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8"
          >
            <LogOut size={14} aria-hidden="true" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-40 bg-[#16283D] text-white px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold" aria-hidden="true" />
            <span className="font-display font-semibold text-sm">JobSim Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md hover:bg-white/10"
            aria-label="Menyu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {open && (
          <div className="lg:hidden bg-[#16283D] text-white pb-4 border-b border-white/10">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        )}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
