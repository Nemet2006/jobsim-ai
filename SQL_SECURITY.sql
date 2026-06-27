-- ============================================================
-- JobSim AI — Production Security Hardening
-- Run in Supabase SQL Editor AFTER all prior SQL migrations.
-- ============================================================

-- ─── 1. Role escalation protection ───────────────────────────

CREATE OR REPLACE FUNCTION public.protect_user_role_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'student'::public.user_role;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_role ON public.users;
CREATE TRIGGER protect_user_role
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_role_field();

-- Secure signup trigger: always student unless service_role creates user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name text;
  v_university text;
  v_company text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_university := NULLIF(NEW.raw_user_meta_data->>'university', '');
  v_company := NULLIF(NEW.raw_user_meta_data->>'company_name', '');

  INSERT INTO public.users (id, email, full_name, role, university, company_name)
  VALUES (NEW.id, NEW.email, v_full_name, 'student'::public.user_role, v_university, v_company)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    university = COALESCE(EXCLUDED.university, public.users.university),
    company_name = COALESCE(EXCLUDED.company_name, public.users.company_name);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Service role may set HR/Courses role (used by register API)
CREATE OR REPLACE FUNCTION public.set_user_role(
  p_user_id uuid,
  p_role public.user_role,
  p_company_name text DEFAULT NULL,
  p_university text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.users
  SET
    role = p_role,
    company_name = COALESCE(p_company_name, company_name),
    university = COALESCE(p_university, university)
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.user_role, text, text) TO service_role;

-- ─── 2. Narrow users SELECT (remove overbroad policy) ──────

DROP POLICY IF EXISTS "Authenticated users can view creator names" ON public.users;

CREATE POLICY "Authenticated can view HR public profiles" ON public.users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND role = 'hr'::public.user_role
  );

-- ─── 3. Attempt scoring integrity ──────────────────────────

CREATE OR REPLACE FUNCTION public.protect_attempt_scoring()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.score IS DISTINCT FROM OLD.score THEN
    NEW.score := OLD.score;
  END IF;

  IF NEW.ai_analysis IS DISTINCT FROM OLD.ai_analysis THEN
    NEW.ai_analysis := OLD.ai_analysis;
  END IF;

  IF NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
    NEW.completed_at := OLD.completed_at;
  END IF;

  IF OLD.status IS DISTINCT FROM 'completed' AND NEW.status = 'completed' THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_attempt_scoring ON public.simulation_attempts;
CREATE TRIGGER protect_attempt_scoring
  BEFORE UPDATE ON public.simulation_attempts
  FOR EACH ROW EXECUTE FUNCTION public.protect_attempt_scoring();

-- ─── 4. Secure group join (code validated server-side) ─────

DROP POLICY IF EXISTS "gm_student_self_insert" ON public.group_members;

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_group_id uuid;
  v_group_name text;
  v_existing uuid;
BEGIN
  IF v_student_id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'auth_required');
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) < 4 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  SELECT g.id, g.name
  INTO v_group_id, v_group_name
  FROM public.course_groups g
  WHERE upper(trim(g.join_code)) = upper(trim(p_code))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'not_found');
  END IF;

  SELECT id INTO v_existing
  FROM public.group_members
  WHERE group_id = v_group_id AND student_id = v_student_id
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN json_build_object('ok', false, 'error', 'already_member', 'group_name', v_group_name);
  END IF;

  INSERT INTO public.group_members (group_id, student_id)
  VALUES (v_group_id, v_student_id);

  RETURN json_build_object('ok', true, 'group_id', v_group_id, 'group_name', v_group_name);
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;

-- ─── 5. API rate limiting ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket_key text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket_key, window_start)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count integer;
BEGIN
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.api_rate_limits (bucket_key, window_start, request_count)
  VALUES (p_bucket_key, v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET request_count = public.api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- Cleanup old windows (optional cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.api_rate_limits WHERE window_start < now() - interval '2 hours';
$$;

-- ─── 6. Promo code idempotency ─────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_premium_promo_user_code
  ON public.premium_subscriptions (user_id, promo_code)
  WHERE promo_code IS NOT NULL;

-- ─── 7. Longer join codes for new groups ───────────────────
-- generate_join_code() is a BEFORE INSERT trigger (not a scalar helper).
-- Must drop trigger + function before changing return type / body.

DROP TRIGGER IF EXISTS set_join_code ON public.course_groups;
DROP FUNCTION IF EXISTS public.generate_join_code();

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code := upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 10));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_join_code
  BEFORE INSERT ON public.course_groups
  FOR EACH ROW EXECUTE FUNCTION public.generate_join_code();
