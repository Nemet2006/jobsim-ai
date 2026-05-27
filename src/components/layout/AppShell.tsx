'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'
import { LogOut, Menu, X, ChevronDown, type LucideIcon } from 'lucide-react'

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
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top navbar (Forage style) */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-forest/8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="JobSim AI ana səhifə">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#FAF5EC" />
                  </svg>
                </div>
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">
                JobSim<span className="text-coral">.</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Əsas naviqasiya">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium ${
                      isActive ? 'text-forest bg-forest-wash' : 'text-ink-mid hover:text-forest hover:bg-forest-wash/60'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right cluster: user menu */}
            <div className="flex items-center gap-2">
              {/* User menu (desktop) */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-forest/12 bg-white hover:border-forest/30 hover:shadow-soft-sm"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Hesab menyusu"
                >
                  <div className="w-7 h-7 rounded-full bg-forest text-cream font-semibold text-xs flex items-center justify-center">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-ink truncate max-w-[120px]">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  {user.is_premium && <span className="tag-coral text-[9px] py-0">PRO</span>}
                  <ChevronDown size={14} className="text-ink-mute" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-forest/8 p-2 z-40"
                      >
                        <div className="px-3 py-2.5 border-b border-forest/8 mb-1">
                          <p className="text-sm font-semibold text-ink truncate">{user.full_name}</p>
                          <p className="text-xs text-ink-mute truncate">{user.email}</p>
                          <p className="text-[10px] uppercase tracking-wider text-forest mt-1 font-semibold">{brand.section}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger-tint"
                          role="menuitem"
                        >
                          <LogOut size={15} aria-hidden="true" />
                          Çıxış
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full border border-forest/12 bg-white hover:bg-forest-wash flex items-center justify-center text-ink"
                aria-label="Menyunu aç"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed right-0 top-0 h-full w-[300px] bg-cream z-50 shadow-soft-xl flex flex-col"
            aria-label="Naviqasiya menyusu"
          >
            <div className="flex items-center justify-between p-5 border-b border-forest/8">
              <span className="font-display text-xl font-semibold">
                Menu<span className="text-coral">.</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-forest-wash flex items-center justify-center text-ink-mid hover:text-ink"
                aria-label="Menyunu bağla"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Mobile naviqasiya">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={isActive ? 'nav-link-active' : 'nav-link'}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-forest/8 space-y-3">
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white border border-forest/8">
                <div className="w-10 h-10 rounded-full bg-forest text-cream font-semibold text-sm flex items-center justify-center">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{user.full_name}</p>
                  <p className="text-xs text-ink-mute truncate">{user.email}</p>
                </div>
                {user.is_premium && <span className="tag-coral">PRO</span>}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-danger-tint text-danger font-medium text-sm hover:bg-danger/15"
                aria-label="Hesabdan çıxış"
              >
                <LogOut size={15} aria-hidden="true" />
                Çıxış
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main id="main" className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-forest/8 bg-cream-paper/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-forest flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#FAF5EC" />
              </svg>
            </div>
            <span className="font-display text-base font-semibold">
              JobSim<span className="text-coral">.</span>
            </span>
          </div>
          <p className="text-xs text-ink-mute">© 2026 JobSim AI · Get noticed. Get hired.</p>
        </div>
      </footer>
    </div>
  )
}
