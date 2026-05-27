'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDifficultyLabel } from '@/lib/utils'
import type { Difficulty } from '@/types'
import { CheckSquare, Square, Send } from 'lucide-react'

interface Student { id: string; full_name: string; university: string | null }
interface Simulation { id: string; title: string; role_type: string; difficulty: string }

interface AssignSimulationClientProps {
  students: Student[]
  simulations: Simulation[]
  assignedPairs: Set<string>
  instructorId: string
}

export default function AssignSimulationClient({ students, simulations, assignedPairs, instructorId }: AssignSimulationClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [selectedSim, setSelectedSim] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  function toggleStudent(id: string) {
    setSelectedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedStudents(new Set(students.map((s) => s.id)))
  }

  async function handleAssign() {
    if (!selectedSim || selectedStudents.size === 0) return
    setSaving(true)

    const newAssignments = [...selectedStudents]
      .filter((sid) => !assignedPairs.has(`${sid}:${selectedSim}`))
      .map((studentId) => ({
        instructor_id: instructorId,
        student_id: studentId,
        simulation_id: selectedSim,
        deadline: deadline || null,
      }))

    if (newAssignments.length > 0) {
      await supabase.from('course_assignments').insert(newAssignments)
    }

    setSaving(false)
    setSuccess(true)
    setSelectedStudents(new Set())
    setSelectedSim('')
    setDeadline('')
    startTransition(() => router.refresh())
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Tapşırıq Ver</h1>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">
          Tapşırıq uğurla təyin edildi!
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Select Students */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Tələbə seç ({selectedStudents.size})</h2>
            <button onClick={selectAll} className="text-xs text-teal-400 hover:text-teal-300">Hamısını seç</button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {students.map((s) => {
              const isSelected = selectedStudents.has(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-teal-500/40 bg-teal-500/10'
                      : 'border-white/5 bg-white/3 hover:bg-white/5'
                  }`}
                >
                  {isSelected ? <CheckSquare size={16} className="text-teal-400 flex-shrink-0" /> : <Square size={16} className="text-slate-500 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-white">{s.full_name}</p>
                    {s.university && <p className="text-xs text-slate-400">{s.university}</p>}
                  </div>
                </button>
              )
            })}
            {students.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Tələbə tapılmadı</p>}
          </div>
        </div>

        {/* Select Simulation */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-base font-semibold text-white">Simulyasiya seç</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {simulations.map((sim) => (
              <button
                key={sim.id}
                onClick={() => setSelectedSim(sim.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSim === sim.id
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-white/5 bg-white/3 hover:bg-white/5'
                }`}
              >
                <p className="text-sm font-medium text-white">{sim.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sim.role_type} • {getDifficultyLabel(sim.difficulty as Difficulty)}
                </p>
              </button>
            ))}
            {simulations.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Simulyasiya yoxdur</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Son tarix (ixtiyari)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-dark w-full"
            />
          </div>

          <button
            onClick={handleAssign}
            disabled={saving || !selectedSim || selectedStudents.size === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Send size={16} />}
            Tapşırığı Təyin Et ({selectedStudents.size} tələbə)
          </button>
        </div>
      </div>
    </div>
  )
}
