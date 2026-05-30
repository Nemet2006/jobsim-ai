import { createAdminClient } from '@/lib/premium'

export async function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_bucket_key: bucketKey,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    })

    if (error) {
      console.warn('Rate limit RPC unavailable:', error.message)
      return true
    }

    return Boolean(data)
  } catch (err) {
    console.warn('Rate limit check failed:', err)
    return true
  }
}

export async function enforceRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowSeconds: number
): Promise<Response | null> {
  const allowed = await checkRateLimit(bucketKey, maxRequests, windowSeconds)
  if (!allowed) {
    return Response.json(
      { error: 'Çox sayda sorğu. Zəhmət olmasa bir az gözləyin.' },
      { status: 429 }
    )
  }
  return null
}
