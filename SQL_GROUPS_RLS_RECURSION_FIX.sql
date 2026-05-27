-- ============================================================
-- JobSim AI — Fix: infinite recursion in course_groups RLS
-- Run this in Supabase SQL Editor (fixes group create + join)
-- ============================================================
--
-- Problem: course_groups policies query group_members, and
-- group_members policies query course_groups → infinite loop.
--
-- Fix: SECURITY DEFINER helper functions bypass RLS for checks.
-- ============================================================

-- ============================================================
-- 1. Helper functions (SECURITY DEFINER = no RLS recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_course_group_instructor(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_groups
    WHERE id = p_group_id
      AND instructor_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = p_group_id
      AND student_id = auth.uid()
  );
$$;

-- Lookup group by join code (for student join flow — no membership required)
CREATE OR REPLACE FUNCTION public.lookup_group_by_join_code(p_code text)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT cg.id, cg.name
  FROM public.course_groups cg
  WHERE cg.join_code = UPPER(TRIM(p_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_course_group_instructor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_course_group_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_group_by_join_code(text) TO authenticated;

-- ============================================================
-- 2. Drop ALL existing policies on these tables
-- ============================================================

-- course_groups
DROP POLICY IF EXISTS "Instructors manage own groups" ON public.course_groups;
DROP POLICY IF EXISTS "Students can see groups they belong to" ON public.course_groups;
DROP POLICY IF EXISTS "cg_instructor_select" ON public.course_groups;
DROP POLICY IF EXISTS "cg_instructor_insert" ON public.course_groups;
DROP POLICY IF EXISTS "cg_instructor_update" ON public.course_groups;
DROP POLICY IF EXISTS "cg_instructor_delete" ON public.course_groups;
DROP POLICY IF EXISTS "cg_student_select" ON public.course_groups;
DROP POLICY IF EXISTS "cg_anyone_joincode_lookup" ON public.course_groups;

-- group_members
DROP POLICY IF EXISTS "Instructors manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Students see own memberships" ON public.group_members;
DROP POLICY IF EXISTS "gm_instructor_select" ON public.group_members;
DROP POLICY IF EXISTS "gm_instructor_insert" ON public.group_members;
DROP POLICY IF EXISTS "gm_instructor_delete" ON public.group_members;
DROP POLICY IF EXISTS "gm_student_select" ON public.group_members;
DROP POLICY IF EXISTS "gm_student_self_insert" ON public.group_members;
DROP POLICY IF EXISTS "gm_student_self_delete" ON public.group_members;

-- group_sim_assignments
DROP POLICY IF EXISTS "Instructors manage group sim assignments" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "Students see sim assignments for their groups" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "gsa_instructor_select" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "gsa_instructor_insert" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "gsa_instructor_update" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "gsa_instructor_delete" ON public.group_sim_assignments;
DROP POLICY IF EXISTS "gsa_student_select" ON public.group_sim_assignments;

-- ============================================================
-- 3. Recreate policies (using helper functions — no recursion)
-- ============================================================

-- ---------- course_groups ----------
CREATE POLICY "cg_instructor_select" ON public.course_groups
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_insert" ON public.course_groups
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_update" ON public.course_groups
  FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "cg_instructor_delete" ON public.course_groups
  FOR DELETE USING (instructor_id = auth.uid());

CREATE POLICY "cg_member_select" ON public.course_groups
  FOR SELECT USING (public.is_course_group_member(id));

-- ---------- group_members ----------
CREATE POLICY "gm_instructor_select" ON public.group_members
  FOR SELECT USING (public.is_course_group_instructor(group_id));

CREATE POLICY "gm_instructor_insert" ON public.group_members
  FOR INSERT WITH CHECK (public.is_course_group_instructor(group_id));

CREATE POLICY "gm_instructor_delete" ON public.group_members
  FOR DELETE USING (public.is_course_group_instructor(group_id));

CREATE POLICY "gm_student_select" ON public.group_members
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "gm_student_self_insert" ON public.group_members
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "gm_student_self_delete" ON public.group_members
  FOR DELETE USING (student_id = auth.uid());

-- ---------- group_sim_assignments ----------
CREATE POLICY "gsa_instructor_select" ON public.group_sim_assignments
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_insert" ON public.group_sim_assignments
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_update" ON public.group_sim_assignments
  FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "gsa_instructor_delete" ON public.group_sim_assignments
  FOR DELETE USING (instructor_id = auth.uid());

CREATE POLICY "gsa_student_select" ON public.group_sim_assignments
  FOR SELECT USING (public.is_course_group_member(group_id));

-- ============================================================
-- 4. Recreate view (uses tables directly — RLS applies per user)
-- ============================================================
DROP VIEW IF EXISTS public.student_assigned_simulations;

CREATE VIEW public.student_assigned_simulations
WITH (security_invoker = true)
AS
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
-- Done. Test as instructor:
--   INSERT INTO course_groups (instructor_id, name) VALUES (auth.uid(), 'Test');
-- ============================================================
