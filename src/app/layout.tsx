import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { getT } from '@/i18n/get-locale'
import { I18nProvider } from '@/i18n/I18nProvider'

const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
  preload: true,
})

const body = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
  preload: false,
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobsim-ai-mvpp.vercel.app'

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getT()
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('meta.title'),
      template: '%s · JobSim AI',
    },
    description: t('meta.description'),
    keywords: ['iş simulyasiyası', 'AI', 'karyera', 'işə qəbul', 'bacarıq', 'job simulation', 'Azerbaijan'],
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: 'z3cz_J0-qB_LGM8nLXf5qxhT25zoGQIwOgz1-WlZZ2w',
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.ogDescription'),
      type: 'website',
      url: SITE_URL,
      siteName: 'JobSim AI',
      locale: locale === 'en' ? 'en_US' : 'az_AZ',
    },
    twitter: {
      card: 'summary',
      title: t('meta.title'),
      description: t('meta.twitterDescription'),
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#F6F3EC',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT()
  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-paper text-ink selection:bg-gold/25 selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-md focus:shadow-soft-lg"
        >
          {t('common.skipToContent')}
        </a>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  )
}
