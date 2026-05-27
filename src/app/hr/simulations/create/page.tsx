export const dynamic = 'force-dynamic'

import CreateSimulationForm from '@/components/hr/CreateSimulationForm'
import { createClient } from '@/lib/supabase/server'

export default async function CreateSimulationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <CreateSimulationForm hrId={user!.id} />
}
