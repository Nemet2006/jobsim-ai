'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics-client'
import type { User } from '@/types'
import { LogOut, Menu, X, ChevronDown, type LucideIcon } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useT } from '@/i18n/I18nProvider'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface AppShellProps {
  children: React.ReactNode
  user: User
  navItems: NavItem[]
  brand: {
    label: string
    section: string
    icon: LucideIcon
  }
}

export function AppShell({ children, user, navItems, brand }: AppShellProps) {
  const { t } = useT()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  async function handleLogout() {
    track('logout', { section: brand.section })
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label={t('common.homeAria')}>
              <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" fill="#F6F3EC" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                JobSim<span className="text-gold">.</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5" aria-label={t('common.navMain')}>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => track('nav_click', { href: item.href, label: item.label })}
                    className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                      isActive
                        ? 'text-navy bg-navy-wash'
                        : 'text-ink-mid hover:text-navy hover:bg-navy-wash/70'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-md border border-navy/12 bg-white hover:border-navy/25"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label={t('common.accountMenu')}
                >
                  <div className="w-6 h-6 rounded-md bg-navy text-paper font-semibold text-[10px] flex items-center justify-center">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-ink truncate max-w-[110px]">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  {user.is_premium && <span className="tag-gold text-[9px] py-0">PRO</span>}
                  <ChevronDown size={13} className="text-ink-mute" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-lg shadow-soft-lg border border-navy/10 p-1.5 z-40"
                      >
                        <div className="px-3 py-2.5 border-b border-navy/8 mb-1">
                          <p className="text-sm font-semibold text-ink truncate">{user.full_name}</p>
                          <p className="text-xs text-ink-mute truncate">{user.email}</p>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-navy mt-1 font-semibold">{brand.section}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-danger hover:bg-danger-tint"
                          role="menuitem"
                        >
                          <LogOut size={14} aria-hidden="true" />
                          {t('common.logout')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 rounded-md border border-navy/12 bg-white hover:bg-navy-wash flex items-center justify-center text-ink"
                aria-label={t('common.openMenu')}
              >
                <Menu size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-ink/25 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed right-0 top-0 h-full w-[280px] bg-paper z-50 shadow-soft-xl flex flex-col"
            aria-label={t('common.navMobile')}
          >
            <div className="flex items-center justify-between p-4 border-b border-navy/10">
              <span className="font-display text-lg font-semibold">
                Menu<span className="text-gold">.</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-md hover:bg-navy-wash flex items-center justify-center text-ink-mid hover:text-ink"
                aria-label={t('common.closeMenu')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto" aria-label="Mobile naviqasiya">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      track('nav_click', { href: item.href, label: item.label })
                      setSidebarOpen(false)
                    }}
                    className={isActive ? 'nav-link-active' : 'nav-link'}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.2 : 1.9} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-3 border-t border-navy/10 space-y-2.5">
              <LanguageSwitcher className="w-full justify-center" />
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-navy/10">
                <div className="w-9 h-9 rounded-md bg-navy text-paper font-semibold text-sm flex items-center justify-center">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{user.full_name}</p>
                  <p className="text-xs text-ink-mute truncate">{user.email}</p>
                </div>
                {user.is_premium && <span className="tag-gold">PRO</span>}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-danger-tint text-danger font-medium text-sm"
                aria-label={t('common.logout')}
              >
                <LogOut size={14} aria-hidden="true" />
                {t('common.logout')}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main id="main" className="max-w-7xl mx-auto px-4 lg:px-8 py-7 lg:py-10">
        {children}
      </main>

      <footer className="mt-16 border-t border-navy/10 bg-paper-warm/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-navy flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" fill="#F6F3EC" />
              </svg>
            </div>
            <span className="font-display text-sm font-semibold">
              JobSim<span className="text-gold">.</span>
            </span>
          </div>
          <p className="text-xs text-ink-mute">© 2026 JobSim AI · Get noticed. Get hired.</p>
        </div>
      </footer>
    </div>
  )
}
