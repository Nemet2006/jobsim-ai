import { NextResponse } from 'next/server'
import { PREMIUM_FEATURE_DISABLED_MESSAGE, PREMIUM_FEATURE_ENABLED } from '@/lib/premium-feature'

export async function POST() {
  if (!PREMIUM_FEATURE_ENABLED) {
    return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
  }

  return NextResponse.json({ error: PREMIUM_FEATURE_DISABLED_MESSAGE }, { status: 503 })
}
