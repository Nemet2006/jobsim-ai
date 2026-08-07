import { CertificateCard } from '@/components/simulation/CertificateCard'
import { CERTIFICATE_SIGNATORIES } from '@/lib/certificate'
import Link from 'next/link'

export const metadata = {
  title: 'Sertifikat nümunəsi · JobSim AI',
  description: 'JobSim AI rəsmi simulyasiya sertifikatı nümunəsi',
  robots: { index: false, follow: false },
}

/** Public sample so the official certificate layout (with founders) is easy to verify. */
export default function CertificateSamplePage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-10 lg:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="h-eyebrow">JobSim AI</p>
          <h1 className="font-display text-3xl font-semibold text-ink">Sertifikat nümunəsi</h1>
          <p className="text-sm text-ink-mid">
            Simulyasiya bitəndən sonra eyni formatda rəsmi imza görünür:
          </p>
          <p className="text-sm text-ink">
            {CERTIFICATE_SIGNATORIES.map((s) => `${s.role}: ${s.name}`).join(' · ')}
          </p>
        </div>

        <CertificateCard
          data={{
            studentName: 'Aysel Məmmədova',
            simulationTitle: 'Backend Developer',
            roleType: 'Software Engineer',
            companyName: 'JobSim AI',
            score: 88,
            completedAt: new Date().toISOString(),
            attemptId: 'sample-cert-0001-abcd',
          }}
        />

        <div className="text-center">
          <Link href="/" className="text-sm font-semibold text-navy hover:underline">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </main>
  )
}
