export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Folders, Plus } from 'lucide-react'
import { EditorialHero } from '@/components/ui/EditorialHero'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/Motion'

export default async function AssignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Groups owned by instructor
  const { data: groups } = await supabase
    .from('course_groups')
    .select('id, name, description')
    .eq('instructor_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <EditorialHero
        eyebrow="Tapşırıq idarəsi"
        title={
          <>
            Simulyasiyanı <span className="italic font-light text-forest">qrupa</span> verin.
          </>
        }
        dek={
          <>
            Qrupu seçin, HR şirkətlərinin simulyasiyalarını tapın, bir klikdə bütün qrupa verin.
            Hər qrup öz tərəqqisini izləyə bilər.
          </>
        }
      />

      {(groups || []).length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-forest-wash flex items-center justify-center">
            <Folders size={28} className="text-forest" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">Hələ qrup yoxdur</h3>
          <p className="text-ink-mid text-sm mb-6 leading-relaxed max-w-xs mx-auto">
            Simulyasiya vermək üçün əvvəlcə bir qrup yaratmalısınız.
          </p>
          <Link href="/courses/groups" className="btn-coral inline-flex">
            <Plus size={14} aria-hidden="true" />
            Qrup yarat
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink-mid mb-6">
            Simulyasiya vermək istədiyiniz qrupu seçin:
          </p>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(groups || []).map((group) => (
              <StaggerItem key={group.id}>
                <Link
                  href={`/courses/groups/${group.id}?tab=simulations`}
                  className="group block card p-6 hover:shadow-soft-md hover:border-forest/20 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-forest text-cream font-display text-xl font-semibold flex items-center justify-center group-hover:scale-105 transition-transform">
                      {group.name[0]?.toUpperCase()}
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-ink-mute group-hover:text-coral group-hover:translate-x-0.5 transition-all"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-forest transition-colors mb-1">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-sm text-ink-mid line-clamp-2">{group.description}</p>
                  )}
                  <p className="mt-4 text-xs font-medium text-coral-deep">
                    Simulyasiya ver →
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}
    </div>
  )
}
