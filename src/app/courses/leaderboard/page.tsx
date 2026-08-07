export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Trophy, Medal } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assignments } = await supabase
    .from('course_assignments')
    .select('student_id, simulation_id')
    .eq('instructor_id', user!.id)

  const studentIds = [...new Set((assignments || []).map((a) => a.student_id))]
  const simIds = [...new Set((assignments || []).map((a) => a.simulation_id))]

  const leaderboard: { id: string; name: string; university: string | null; avg: number; completed: number }[] = []

  if (studentIds.length > 0 && simIds.length > 0) {
    const { data: attempts } = await supabase
      .from('simulation_attempts')
      .select('student_id, score')
      .in('student_id', studentIds)
      .in('simulation_id', simIds)
      .eq('status', 'completed')

    for (const sid of studentIds) {
      const { data: studentData } = await supabase.from('users').select('full_name, university').eq('id', sid).single()
      const studentAttempts = (attempts || []).filter((a) => a.student_id === sid)
      const avg = studentAttempts.length
        ? Math.round(studentAttempts.reduce((s, a) => s + (a.score || 0), 0) / studentAttempts.length)
        : 0
      leaderboard.push({
        id: sid,
        name: studentData?.full_name || 'Tələbə',
        university: studentData?.university || null,
        avg,
        completed: studentAttempts.length,
      })
    }
    leaderboard.sort((a, b) => b.avg - a.avg)
  }

  const RANK_STYLES = [
    { bg: 'bg-gold-wash', border: 'border-gold/40', text: 'text-gold-deep', icon: Trophy },
    { bg: 'bg-navy-wash', border: 'border-navy/25', text: 'text-navy', icon: Medal },
    { bg: 'bg-verdigris-wash', border: 'border-verdigris/30', text: 'text-verdigris', icon: Medal },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink flex items-center gap-2">
          <Trophy size={24} className="text-gold" />
          Reytinq Cədvəli
        </h1>
        <p className="text-ink-mute text-sm mt-1">{leaderboard.length} tələbə</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card-dossier p-12 text-center">
          <Trophy size={40} className="text-ink-mute mx-auto mb-4" />
          <p className="text-ink-mute">Hələ reytinq məlumatı yoxdur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((s, i) => {
            const rankStyle = RANK_STYLES[i] || { bg: 'bg-paper-deep', border: 'border-navy/8', text: 'text-ink-mute', icon: null }
            const Icon = rankStyle.icon
            return (
              <div key={s.id} className={`card-dossier p-4 flex items-center gap-4 ${i < 3 ? `border ${rankStyle.border}` : ''}`}>
                <div className={`w-10 h-10 rounded-lg ${rankStyle.bg} border ${rankStyle.border} flex items-center justify-center font-bold text-sm ${rankStyle.text}`}>
                  {i < 3 && Icon ? <Icon size={18} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-ink">{s.name}</p>
                  {s.university && <p className="text-xs text-ink-mute mt-0.5">{s.university}</p>}
                </div>
                <div className="text-right">
                  <div className={`number-display text-2xl ${
                    s.avg >= 71 ? 'text-verdigris' : s.avg >= 41 ? 'text-gold-deep' : 'text-danger'
                  }`}>
                    {s.avg}
                  </div>
                  <p className="text-xs text-ink-mute">{s.completed} tamamlanmış</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
