-- JobSim AI — RLS Policy Fix
-- Run this after SQL_SCHEMA.sql to fix the infinite recursion in users table policies.

-- Helper function: gets user role without triggering RLS (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = user_id;
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "HR can view student profiles" ON public.users;
DROP POLICY IF EXISTS "Courses can view student profiles" ON public.users;
DROP POLICY IF EXISTS "HR can create simulations" ON public.simulations;
DROP POLICY IF EXISTS "HR can view skill passports" ON public.skill_passport;

-- Recreate with the SECURITY DEFINER function
CREATE POLICY "HR can view all users" ON public.users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'hr');

CREATE POLICY "Courses can view all users" ON public.users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'courses');

CREATE POLICY "HR can create simulations" ON public.simulations
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'hr');

CREATE POLICY "HR and Courses can view skill passports" ON public.skill_passport
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('hr', 'courses'));

-- Allow students to be looked up by HR for shortlist/candidates (already covered above)
-- Allow public read of simulation creators (for showing company_name on simulation cards)
DROP POLICY IF EXISTS "Authenticated users can view creator names" ON public.users;
CREATE POLICY "Authenticated users can view creator names" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);
