import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import type { AdminAnalyticsSnapshot } from '@/lib/admin-analytics'

export interface ReportProofMetrics {
  totalUsers: number
  signUps: number
  signIns: number
  uniqueSimulators: number
  simulationsStarted: number
  simulationsCompleted: number
  tasksShared: number
  totalClicks: number
  pageViews: number
  avgScore: number | null
}

export interface ReportProofPayload {
  v: 1
  id: string
  range: string
  generatedAt: string
  metrics: ReportProofMetrics
}

function proofSecret(): string {
  return (
    process.env.REPORT_PROOF_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'jobsim-report-proof-dev'
  )
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4)
  return Buffer.from(padded, 'base64').toString('utf8')
}

function canonicalMetrics(snapshot: AdminAnalyticsSnapshot): ReportProofMetrics {
  return {
    totalUsers: snapshot.totals.totalUsers,
    signUps: snapshot.core.signUps.total,
    signIns: snapshot.core.signIns.total,
    uniqueSimulators: snapshot.core.uniqueSimulators,
    simulationsStarted: snapshot.core.simulationsStarted,
    simulationsCompleted: snapshot.core.simulationsCompleted,
    tasksShared: snapshot.core.tasksShared.total,
    totalClicks: snapshot.core.totalClicks,
    pageViews: snapshot.core.pageViews,
    avgScore: snapshot.core.avgScore,
  }
}

function makeReportId(snapshot: AdminAnalyticsSnapshot): string {
  const digest = createHash('sha256')
    .update(
      `${snapshot.generatedAt}|${snapshot.range}|${JSON.stringify(canonicalMetrics(snapshot))}`
    )
    .digest('hex')
    .slice(0, 10)
    .toUpperCase()
  const day = snapshot.generatedAt.slice(0, 10).replace(/-/g, '')
  return `JSIM-${day}-${digest}`
}

function signBody(body: string): string {
  return createHmac('sha256', proofSecret()).update(body).digest('hex')
}

export function createReportProof(snapshot: AdminAnalyticsSnapshot): {
  payload: ReportProofPayload
  token: string
  verifyUrl: string
} {
  const payload: ReportProofPayload = {
    v: 1,
    id: makeReportId(snapshot),
    range: snapshot.range,
    generatedAt: snapshot.generatedAt,
    metrics: canonicalMetrics(snapshot),
  }
  const body = toBase64Url(JSON.stringify(payload))
  const sig = signBody(body)
  const token = `${body}.${sig}`

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://jobsim-ai-mvpp.vercel.app'
  const verifyUrl = `${site.replace(/\/$/, '')}/verify/report?t=${encodeURIComponent(token)}`

  return { payload, token, verifyUrl }
}

export function verifyReportProofToken(
  token: string
): { ok: true; payload: ReportProofPayload } | { ok: false; error: string } {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return { ok: false, error: 'invalid_format' }
    const [body, sig] = parts
    if (!body || !sig || !/^[a-f0-9]{64}$/i.test(sig)) {
      return { ok: false, error: 'invalid_format' }
    }

    const expected = signBody(body)
    const a = Buffer.from(sig.toLowerCase(), 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: 'bad_signature' }
    }

    const parsed = JSON.parse(fromBase64Url(body)) as ReportProofPayload
    if (parsed?.v !== 1 || !parsed.id || !parsed.metrics) {
      return { ok: false, error: 'invalid_payload' }
    }
    return { ok: true, payload: parsed }
  } catch {
    return { ok: false, error: 'parse_failed' }
  }
}

/** PNG data URL for QR embedding into jsPDF. */
export async function buildProofQrDataUrl(verifyUrl: string): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 640,
    color: { dark: '#16283D', light: '#FFFFFF' },
  })
}
