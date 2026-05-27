-- JobSim AI — Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'hr', 'courses');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE simulation_status AS ENUM ('in_progress', 'completed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  university TEXT,
  company_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulations table
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  role_type TEXT NOT NULL,
  difficulty difficulty_level NOT NULL,
  duration_minutes INTEGER NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation attempts table
CREATE TABLE public.simulation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status simulation_status DEFAULT 'in_progress',
  answers JSONB DEFAULT '{}',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  ai_analysis JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cheat_attempts INTEGER DEFAULT 0
);

-- Shortlist table
CREATE TABLE public.shortlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hr_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.simulation_attempts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hr_id, attempt_id)
);

-- Skill passport table
CREATE TABLE public.skill_passport (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  skills JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course assignments table
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_passport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "HR can view student profiles" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hr')
  );
CREATE POLICY "Courses can view student profiles" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'courses')
  );

-- Simulations policies
CREATE POLICY "Anyone authenticated can view published simulations" ON public.simulations
  FOR SELECT USING (auth.uid() IS NOT NULL AND (is_published = TRUE OR created_by = auth.uid()));
CREATE POLICY "HR can create simulations" ON public.simulations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hr')
  );
CREATE POLICY "HR can update own simulations" ON public.simulations
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "HR can delete own simulations" ON public.simulations
  FOR DELETE USING (created_by = auth.uid());

-- Simulation attempts policies
CREATE POLICY "Students can view own attempts" ON public.simulation_attempts
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create attempts" ON public.simulation_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update own attempts" ON public.simulation_attempts
  FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "HR can view attempts for their simulations" ON public.simulation_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.simulations s
      WHERE s.id = simulation_id AND s.created_by = auth.uid()
    )
  );
CREATE POLICY "Courses can view assigned attempts" ON public.simulation_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_assignments ca
      WHERE ca.student_id = simulation_attempts.student_id
        AND ca.instructor_id = auth.uid()
    )
  );

-- Shortlist policies
CREATE POLICY "HR can manage own shortlist" ON public.shortlist
  FOR ALL USING (hr_id = auth.uid());

-- Skill passport policies
CREATE POLICY "Students can manage own skill passport" ON public.skill_passport
  FOR ALL USING (student_id = auth.uid());
CREATE POLICY "HR can view skill passports" ON public.skill_passport
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('hr', 'courses'))
  );

-- Course assignments policies
CREATE POLICY "Instructors can manage own assignments" ON public.course_assignments
  FOR ALL USING (instructor_id = auth.uid());
CREATE POLICY "Students can view own assignments" ON public.course_assignments
  FOR SELECT USING (student_id = auth.uid());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
