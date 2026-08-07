import type { Metadata } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
})

const body = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobsim-ai-mvpp.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JobSim AI — Get noticed. Get hired.',
    template: '%s · JobSim AI',
  },
  description:
    'Real iş simulyasiyaları ilə bacarıqlarını sübut et. AI qiymətləndirmə, sertifikat və bacarıq pasportu. Pulsuz, self-paced.',
  keywords: ['iş simulyasiyası', 'AI', 'karyera', 'işə qəbul', 'bacarıq', 'job simulation', 'Azərbaycan'],
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
    title: 'JobSim AI — Get noticed. Get hired.',
    description: 'Pulsuz iş simulyasiyaları ilə işə hazırlaş. AI qiymətləndirmə və sertifikat.',
    type: 'website',
    url: SITE_URL,
    siteName: 'JobSim AI',
    locale: 'az_AZ',
  },
  twitter: {
    card: 'summary',
    title: 'JobSim AI — Get noticed. Get hired.',
    description: 'Pulsuz iş simulyasiyaları ilə işə hazırlaş',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="az"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-paper text-ink selection:bg-gold/25 selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-navy focus:text-paper focus:rounded-md focus:shadow-soft-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
