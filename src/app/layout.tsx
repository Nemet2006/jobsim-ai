import type { Metadata } from 'next'
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})

const body = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JobSim AI — Get noticed. Get hired.',
  description: 'Real iş simulyasiyaları ilə bacarıqlarını sübut et. Pulsuz, self-paced, AI-powered.',
  keywords: ['iş simulyasiyası', 'AI', 'karyera', 'işə qəbul', 'bacarıq', 'job simulation'],
  openGraph: {
    title: 'JobSim AI — Get noticed. Get hired.',
    description: 'Pulsuz iş simulyasiyaları ilə işə hazırlaş',
    type: 'website',
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
      <body className="font-body antialiased bg-cream text-ink selection:bg-coral/30 selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-forest focus:text-cream focus:rounded-lg focus:shadow-soft-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
