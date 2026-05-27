export type UserRole = 'student' | 'hr' | 'courses'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type SimulationStatus = 'in_progress' | 'completed' | 'cancelled'
export type QuestionType = 'open_ended' | 'multiple_choice' | 'code' | 'file_upload'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  university: string | null
  company_name: string | null
  avatar_url: string | null
  is_premium: boolean
  created_at: string
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correct_option?: number
  code_language?: string
  placeholder?: string
  instructions?: string
  accepted_formats?: string
}

export interface Simulation {
  id: string
  title: string
  description: string
  role_type: string
  difficulty: Difficulty
  duration_minutes: number
  questions: Question[]
  created_by: string
  is_published: boolean
  created_at: string
  creator?: User
}

export interface SkillScores {
  communication: number
  problem_solving: number
  analytical_thinking: number
  structure: number
  creativity: number
}

export interface AIAnalysis {
  strengths: string[]
  weaknesses: string[]
  advice: string[]
  detailed_feedback: string
  skill_scores: SkillScores
}

export interface SimulationAttempt {
  id: string
  simulation_id: string
  student_id: string
  status: SimulationStatus
  answers: Record<string, string> | null
  score: number | null
  ai_analysis: unknown | null
  started_at: string
  completed_at: string | null
  cheat_attempts: number
  simulation?: Partial<Simulation>
  student?: Partial<User>
}

export interface Shortlist {
  id: string
  hr_id: string
  student_id: string
  simulation_id: string
  attempt_id: string
  added_at: string
  student?: User
  simulation?: Simulation
  attempt?: SimulationAttempt
}

export interface Skill {
  skill_name: string
  score: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

export interface SkillPassport {
  id: string
  student_id: string
  skills: Skill[]
  updated_at: string
}

export interface CourseAssignment {
  id: string
  instructor_id: string
  student_id: string
  simulation_id: string
  assigned_at: string
  deadline?: string | null
  student?: User
  simulation?: Simulation
}

export interface AIAnalyzeRequest {
  simulationTitle: string
  roleType: string
  questions: Array<{
    question: string
    answer: string
  }>
}

export interface AIAnalyzeResponse extends AIAnalysis {
  score: number
}
