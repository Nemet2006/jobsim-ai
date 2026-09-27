import Link from 'next/link'
import type { ReactNode } from 'react'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { getT } from '@/i18n/get-locale'

/** Header + footer for logged-out marketing pages (catalog, certificate verification). */
export async function PublicShell({ children }: { children: ReactNode }) {
  const { t } = await getT()

  return (
    <div className="min-h-screen relative flex flex-col">
      <AuroraBackground variant="auth" />

      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="JobSim AI">
            <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z" fill="#F6F3EC" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              JobSim<span className="text-gold-deep">.</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2.5 sm:gap-4" aria-label="Main">
            <Link href="/simulations" className="hidden sm:inline text-sm font-medium text-ink-mid hover:text-navy">
              {t('public.navSimulations')}
            </Link>
            <Link href="/verify" className="hidden md:inline text-sm font-medium text-ink-mid hover:text-navy">
              {t('public.navVerify')}
            </Link>
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-ink-mid hover:text-navy whitespace-nowrap">
              {t('common.login')}
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-3 sm:px-4 whitespace-nowrap">
              {t('common.startFree')}
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>

      <footer className="relative z-10 border-t border-navy/10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-sm font-semibold">
            JobSim<span className="text-gold-deep">.</span>
          </span>
          <div className="flex items-center gap-4 text-xs text-ink-mute">
            <Link href="/simulations" className="hover:text-navy">{t('public.navSimulations')}</Link>
            <Link href="/verify" className="hover:text-navy">{t('public.navVerify')}</Link>
            <span>© 2026 JobSim AI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
