import { NextResponse } from 'next/server'
import { PREMIUM_FEATURE_DISABLED_MESSAGE, PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

export const runtime = 'nodejs'

export async function POST() {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json(
      { received: true, ignored: true, message: PREMIUM_FEATURE_DISABLED_MESSAGE },
      { status: 200 }
    )
  }

  return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
}
