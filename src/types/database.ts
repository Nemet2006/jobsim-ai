export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'hr' | 'courses'
          university: string | null
          company_name: string | null
          avatar_url: string | null
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'hr' | 'courses'
          university?: string | null
          company_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'hr' | 'courses'
          university?: string | null
          company_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          id: string
          title: string
          description: string
          role_type: string
          difficulty: 'easy' | 'medium' | 'hard'
          duration_minutes: number
          questions: Json
          created_by: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          role_type: string
          difficulty: 'easy' | 'medium' | 'hard'
          duration_minutes: number
          questions: Json
          created_by: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          role_type?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          duration_minutes?: number
          questions?: Json
          created_by?: string
          is_published?: boolean
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'simulations_created_by_fkey'; columns: ['created_by']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      simulation_attempts: {
        Row: {
          id: string
          simulation_id: string
          student_id: string
          status: 'in_progress' | 'completed' | 'cancelled'
          answers: Json
          score: number | null
          ai_analysis: Json | null
          started_at: string
          completed_at: string | null
          cheat_attempts: number
        }
        Insert: {
          id?: string
          simulation_id: string
          student_id: string
          status?: 'in_progress' | 'completed' | 'cancelled'
          answers?: Json
          score?: number | null
          ai_analysis?: Json | null
          started_at?: string
          completed_at?: string | null
          cheat_attempts?: number
        }
        Update: {
          id?: string
          simulation_id?: string
          student_id?: string
          status?: 'in_progress' | 'completed' | 'cancelled'
          answers?: Json
          score?: number | null
          ai_analysis?: Json | null
          started_at?: string
          completed_at?: string | null
          cheat_attempts?: number
        }
        Relationships: [
          { foreignKeyName: 'simulation_attempts_simulation_id_fkey'; columns: ['simulation_id']; referencedRelation: 'simulations'; referencedColumns: ['id'] },
          { foreignKeyName: 'simulation_attempts_student_id_fkey'; columns: ['student_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      shortlist: {
        Row: {
          id: string
          hr_id: string
          student_id: string
          simulation_id: string
          attempt_id: string
          added_at: string
        }
        Insert: {
          id?: string
          hr_id: string
          student_id: string
          simulation_id: string
          attempt_id: string
          added_at?: string
        }
        Update: {
          id?: string
          hr_id?: string
          student_id?: string
          simulation_id?: string
          attempt_id?: string
          added_at?: string
        }
        Relationships: [
          { foreignKeyName: 'shortlist_hr_id_fkey'; columns: ['hr_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'shortlist_student_id_fkey'; columns: ['student_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'shortlist_simulation_id_fkey'; columns: ['simulation_id']; referencedRelation: 'simulations'; referencedColumns: ['id'] },
          { foreignKeyName: 'shortlist_attempt_id_fkey'; columns: ['attempt_id']; referencedRelation: 'simulation_attempts'; referencedColumns: ['id'] }
        ]
      }
      skill_passport: {
        Row: {
          id: string
          student_id: string
          skills: Json
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          skills: Json
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          skills?: Json
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'skill_passport_student_id_fkey'; columns: ['student_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      course_assignments: {
        Row: {
          id: string
          instructor_id: string
          student_id: string
          simulation_id: string
          assigned_at: string
          deadline: string | null
          group_id: string | null
        }
        Insert: {
          id?: string
          instructor_id: string
          student_id: string
          simulation_id: string
          assigned_at?: string
          deadline?: string | null
          group_id?: string | null
        }
        Update: {
          id?: string
          instructor_id?: string
          student_id?: string
          simulation_id?: string
          assigned_at?: string
          deadline?: string | null
          group_id?: string | null
        }
        Relationships: [
          { foreignKeyName: 'course_assignments_instructor_id_fkey'; columns: ['instructor_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'course_assignments_student_id_fkey'; columns: ['student_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'course_assignments_simulation_id_fkey'; columns: ['simulation_id']; referencedRelation: 'simulations'; referencedColumns: ['id'] }
        ]
      }
      course_groups: {
        Row: {
          id: string
          instructor_id: string
          name: string
          description: string | null
          join_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          name: string
          description?: string | null
          join_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          name?: string
          description?: string | null
          join_code?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'course_groups_instructor_id_fkey'; columns: ['instructor_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          student_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          student_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          student_id?: string
          joined_at?: string
        }
        Relationships: [
          { foreignKeyName: 'group_members_group_id_fkey'; columns: ['group_id']; referencedRelation: 'course_groups'; referencedColumns: ['id'] },
          { foreignKeyName: 'group_members_student_id_fkey'; columns: ['student_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      group_sim_assignments: {
        Row: {
          id: string
          group_id: string
          simulation_id: string
          instructor_id: string
          deadline: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          group_id: string
          simulation_id: string
          instructor_id: string
          deadline?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          simulation_id?: string
          instructor_id?: string
          deadline?: string | null
          assigned_at?: string
        }
        Relationships: [
          { foreignKeyName: 'group_sim_assignments_group_id_fkey'; columns: ['group_id']; referencedRelation: 'course_groups'; referencedColumns: ['id'] },
          { foreignKeyName: 'group_sim_assignments_simulation_id_fkey'; columns: ['simulation_id']; referencedRelation: 'simulations'; referencedColumns: ['id'] },
          { foreignKeyName: 'group_sim_assignments_instructor_id_fkey'; columns: ['instructor_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          plan: string
          provider: string
          stripe_session_id: string | null
          stripe_payment_id: string | null
          promo_code: string | null
          amount_cents: number | null
          currency: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          plan?: string
          provider?: string
          stripe_session_id?: string | null
          stripe_payment_id?: string | null
          promo_code?: string | null
          amount_cents?: number | null
          currency?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          plan?: string
          provider?: string
          stripe_session_id?: string | null
          stripe_payment_id?: string | null
          promo_code?: string | null
          amount_cents?: number | null
          currency?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'premium_subscriptions_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: {
      student_assigned_simulations: {
        Row: {
          simulation_id: string
          group_id: string
          group_name: string
          group_join_code: string | null
          deadline: string | null
          assigned_at: string
          student_id: string
          instructor_id: string
        }
        Relationships: []
      }
    }
    Functions: {
      is_course_group_instructor: {
        Args: { p_group_id: string }
        Returns: boolean
      }
      is_course_group_member: {
        Args: { p_group_id: string }
        Returns: boolean
      }
      lookup_group_by_join_code: {
        Args: { p_code: string }
        Returns: { id: string; name: string }[]
      }
      activate_user_premium: {
        Args: {
          p_user_id: string
          p_provider?: string
          p_stripe_session_id?: string | null
          p_stripe_payment_id?: string | null
          p_promo_code?: string | null
          p_amount_cents?: number | null
          p_currency?: string
          p_expires_at?: string | null
        }
        Returns: undefined
      }
      join_group_by_code: {
        Args: { p_code: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_bucket_key: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      set_user_role: {
        Args: {
          p_user_id: string
          p_role: Database['public']['Enums']['user_role']
          p_company_name?: string | null
          p_university?: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'student' | 'hr' | 'courses'
      difficulty: 'easy' | 'medium' | 'hard'
      simulation_status: 'in_progress' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
