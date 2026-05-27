-- ============================================================
-- JobSim AI — Groups RLS Fix + Join Code
-- Run this AFTER SQL_GROUPS_MIGRATION.sql in Supabase SQL Editor
-- ============================================================

-- 1. Add join_code column (unique 6-char uppercase code for students to join)
ALTER TABLE public.course_groups
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Auto-generate join codes for existing groups (if any)
UPDATE public.course_groups
SET join_code = UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 6))
WHERE join_code IS NULL;

-- Trigger to auto-generate join_code on insert
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_join_code ON public.course_groups;
CREATE TRIGGER set_join_code
  BEFORE INSERT ON public.course_groups
  FOR EACH ROW EXECUTE FUNCTION public.generate_join_code();

-- ============================================================
-- 2. Fix RLS Policies (FOR ALL USING doesn't cover INSERT)
-- ============================================================

-- Drop old broken policies
DROP POLICY IF EXISTS "Instructors manage own groups" ON public.course_groups;
DROP POLICY IF EXISTS "Students can see groups they belong to" ON public.course_groups;
DROP POLICY IF EXISTS "Instructors manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Students see own memberships" ON public.group_members;
DROP POLICY IF EXISTS "Instructors manage group sim assignments" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "Students see sim assignments for their groups" ON public.group_sim_assignments;

-- course_groups — FIXED policies
CREATE POLICY "cg_instructor_select" ON public.course_groups
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_insert" ON public.course_groups
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_update" ON public.course_groups
  FOR UPDATE USING (instructor_id = auth.uid()) WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_delete" ON public.course_groups
  FOR DELETE USING (instructor_id = auth.uid());

CREATE POLICY "cg_student_select" ON public.course_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = course_groups.id AND gm.student_id = auth.uid()
    )
  );

-- group_members — FIXED policies
CREATE POLICY "gm_instructor_select" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_groups cg
      WHERE cg.id = group_members.group_id AND cg.instructor_id = auth.uid()
    )
  );

CREATE POLICY "gm_instructor_insert" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_groups cg
      WHERE cg.id = group_members.group_id AND cg.instructor_id = auth.uid()
    )
  );

CREATE POLICY "gm_instructor_delete" ON public.group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.course_groups cg
      WHERE cg.id = group_members.group_id AND cg.instructor_id = auth.uid()
    )
  );

CREATE POLICY "gm_student_select" ON public.group_members
  FOR SELECT USING (student_id = auth.uid());

-- Students can insert themselves when they have the join code
-- (validated at application level; we trust authenticated users here)
CREATE POLICY "gm_student_self_insert" ON public.group_members
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can leave a group
CREATE POLICY "gm_student_self_delete" ON public.group_members
  FOR DELETE USING (student_id = auth.uid());

-- group_sim_assignments — FIXED policies
CREATE POLICY "gsa_instructor_select" ON public.group_sim_assignments
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_insert" ON public.group_sim_assignments
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_update" ON public.group_sim_assignments
  FOR UPDATE USING (instructor_id = auth.uid()) WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_delete" ON public.group_sim_assignments
  FOR DELETE USING (instructor_id = auth.uid());

CREATE POLICY "gsa_student_select" ON public.group_sim_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_sim_assignments.group_id AND gm.student_id = auth.uid()
    )
  );

-- ============================================================
-- 3. Recreate the view (drop & recreate in case of schema change)
-- ============================================================
DROP VIEW IF EXISTS public.student_assigned_simulations;

CREATE VIEW public.student_assigned_simulations AS
SELECT
  gsa.simulation_id,
  gsa.group_id,
  cg.name          AS group_name,
  cg.join_code     AS group_join_code,
  gsa.deadline,
  gsa.assigned_at,
  gm.student_id,
  cg.instructor_id
FROM public.group_sim_assignments gsa
JOIN public.course_groups          cg  ON cg.id       = gsa.group_id
JOIN public.group_members          gm  ON gm.group_id = gsa.group_id;

GRANT SELECT ON public.student_assigned_simulations TO authenticated;

-- ============================================================
-- 4. Join code lookup
-- ============================================================
-- Do NOT add "FOR SELECT USING (TRUE)" on course_groups — it causes
-- policy evaluation loops. Use lookup_group_by_join_code() RPC instead.
-- See SQL_GROUPS_RLS_RECURSION_FIX.sql for the full non-recursive policy set.
