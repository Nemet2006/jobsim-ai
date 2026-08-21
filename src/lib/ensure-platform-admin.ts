import { createAdminClient } from '@/lib/premium'
import { isPlatformAdminEmail } from '@/lib/platform-admin'

/** Promote a allowlisted owner email to role=admin (service_role bypasses the role trigger). */
export async function ensurePlatformAdmin(
  userId: string,
  email?: string | null,
): Promise<boolean> {
  if (!isPlatformAdminEmail(email)) return false

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) {
    console.error('ensurePlatformAdmin:', error.message)
    return false
  }
  return true
}
