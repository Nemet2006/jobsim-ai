-- ============================================================
-- JobSim AI — Course Groups Migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Groups table (one instructor can have many groups)
CREATE TABLE IF NOT EXISTS public.course_groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Group members (many-to-many: group ↔ student)
CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id   UUID NOT NULL REFERENCES public.course_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

-- 3. Group simulation assignments (which sims are assigned to a group)
--    Each assignment here means ALL current members of that group receive it.
CREATE TABLE IF NOT EXISTS public.group_sim_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES public.course_groups(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deadline    TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, simulation_id)
);

-- 4. Add group_id column to existing course_assignments (nullable, back-compat)
ALTER TABLE public.course_assignments
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.course_groups(id) ON DELETE SET NULL;

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.course_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sim_assignments ENABLE ROW LEVEL SECURITY;

-- course_groups
CREATE POLICY "Instructors manage own groups"
  ON public.course_groups FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Students can see groups they belong to"
  ON public.course_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = course_groups.id AND gm.student_id = auth.uid()
    )
  );

-- group_members
CREATE POLICY "Instructors manage group members"
  ON public.group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.course_groups cg
      WHERE cg.id = group_members.group_id AND cg.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students see own memberships"
  ON public.group_members FOR SELECT
  USING (student_id = auth.uid());

-- group_sim_assignments
CREATE POLICY "Instructors manage group sim assignments"
  ON public.group_sim_assignments FOR ALL
  USING (instructor_id = auth.uid());

CREATE POLICY "Students see sim assignments for their groups"
  ON public.group_sim_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_sim_assignments.group_id AND gm.student_id = auth.uid()
    )
  );

-- ============================================================
-- Helper view: student's assigned simulations (from groups)
-- ============================================================
CREATE OR REPLACE VIEW public.student_assigned_simulations AS
SELECT
  gsa.simulation_id,
  gsa.group_id,
  cg.name          AS group_name,
  gsa.deadline,
  gsa.assigned_at,
  gm.student_id,
  cg.instructor_id
FROM public.group_sim_assignments gsa
JOIN public.course_groups          cg  ON cg.id  = gsa.group_id
JOIN public.group_members          gm  ON gm.group_id = gsa.group_id;

-- Grant access to the view
GRANT SELECT ON public.student_assigned_simulations TO authenticated;
