-- ============================================================
-- JobSim AI — Platform Traction / Analytics System
-- Run in Supabase SQL Editor AFTER all prior SQL migrations
-- (SQL_SCHEMA → SQL_FIX_POLICIES → SQL_PREMIUM → SQL_STORAGE →
--  SQL_SECURITY → group migrations → THIS FILE).
--
-- Adds:
--   1. 'admin' user role (platform operator)
--   2. analytics_events raw event table (privacy-safe, default-deny RLS)
--   3. analytics_summary() aggregate RPC (service_role only)
--   4. Retention cleanup + daily rollup functions (for cron)
-- ============================================================

-- ─── 1. Admin role ──────────────────────────────────────────
-- NOTE: the new enum value is never *used* inside this same
-- transaction (all policies below compare text), so the whole
-- file can be run in a single execution.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- Allow role management from the SQL editor (direct DB access has
-- no PostgREST JWT). PostgREST requests always carry a jwt role
-- (anon/authenticated/service_role), so this does NOT weaken the
-- protection against client-side role escalation.
CREATE OR REPLACE FUNCTION public.protect_user_role_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.jwt() IS NULL OR COALESCE(auth.jwt()->>'role', '') = 'service_role' THEN
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

-- Admin can read every core table (read-only oversight).
CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admin can view all simulations" ON public.simulations
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admin can view all attempts" ON public.simulation_attempts
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admin can view all subscriptions" ON public.premium_subscriptions
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- ─── How to promote a user to admin ─────────────────────────
-- Run in the SQL editor (replace the email):
--   UPDATE public.users SET role = 'admin' WHERE email = 'you@company.com';
-- Admin accounts can NOT be created through the register API.

-- ─── 2. Raw analytics events ────────────────────────────────
-- Privacy rules (enforced by the app layer too):
--   * NO email, full name, answers, or raw IP is ever stored.
--   * user_id (UUID), anonymous session_id, event name, path,
--     referrer and a whitelisted JSON properties bag only.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE,                        -- optional dedup key
  event_name TEXT NOT NULL CHECK (char_length(event_name) <= 64),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT CHECK (session_id IS NULL OR char_length(session_id) <= 64),
  role TEXT CHECK (role IS NULL OR char_length(role) <= 16),
  page_path TEXT CHECK (page_path IS NULL OR char_length(page_path) <= 300),
  referrer TEXT CHECK (referrer IS NULL OR char_length(referrer) <= 300),
  properties JSONB NOT NULL DEFAULT '{}' CHECK (pg_column_size(properties) <= 4096)
);

CREATE INDEX IF NOT EXISTS idx_ae_name_time
  ON public.analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_time
  ON public.analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_user_time
  ON public.analytics_events (user_id, occurred_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ae_session
  ON public.analytics_events (session_id)
  WHERE session_id IS NOT NULL;

-- Default deny: RLS enabled with no anon/authenticated policies.
-- Only service_role (API routes) writes; admins read via policy.
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view analytics events" ON public.analytics_events
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- ─── 3. Aggregate summary RPC (service_role only) ───────────

CREATE OR REPLACE FUNCTION public.analytics_summary(p_since timestamptz)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'page_views', (
      SELECT count(*) FROM public.analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= p_since
    ),
    'unique_visitors', (
      SELECT count(DISTINCT session_id) FROM public.analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= p_since AND session_id IS NOT NULL
    ),
    'active_users', (
      SELECT count(DISTINCT user_id) FROM public.analytics_events
      WHERE occurred_at >= p_since AND user_id IS NOT NULL
    ),
    'interaction_events', (
      SELECT count(*) FROM public.analytics_events
      WHERE event_name <> 'page_view' AND occurred_at >= p_since
    ),
    'top_pages', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT page_path, count(*) AS views, count(DISTINCT session_id) AS visitors
        FROM public.analytics_events
        WHERE event_name = 'page_view' AND occurred_at >= p_since AND page_path IS NOT NULL
        GROUP BY page_path ORDER BY views DESC LIMIT 12
      ) t
    ),
    'top_events', (
      SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT event_name, count(*) AS total
        FROM public.analytics_events
        WHERE event_name <> 'page_view' AND occurred_at >= p_since
        GROUP BY event_name ORDER BY total DESC LIMIT 15
      ) t
    ),
    'daily', (
      SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.day), '[]'::jsonb) FROM (
        SELECT
          date_trunc('day', occurred_at)::date AS day,
          count(*) FILTER (WHERE event_name = 'page_view') AS page_views,
          count(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') AS visitors,
          count(*) FILTER (WHERE event_name = 'user_registered') AS registrations,
          count(*) FILTER (WHERE event_name = 'simulation_completed') AS completions
        FROM public.analytics_events
        WHERE occurred_at >= p_since
        GROUP BY 1
      ) d
    ),
    'funnel', jsonb_build_object(
      'visitors', (
        SELECT count(DISTINCT session_id) FROM public.analytics_events
        WHERE event_name = 'page_view' AND occurred_at >= p_since AND session_id IS NOT NULL
      ),
      'registered', (
        SELECT count(*) FROM public.analytics_events
        WHERE event_name = 'user_registered' AND occurred_at >= p_since
      ),
      'simulation_started', (
        SELECT count(DISTINCT user_id) FROM public.analytics_events
        WHERE event_name = 'simulation_started' AND occurred_at >= p_since AND user_id IS NOT NULL
      ),
      'simulation_completed', (
        SELECT count(DISTINCT user_id) FROM public.analytics_events
        WHERE event_name = 'simulation_completed' AND occurred_at >= p_since AND user_id IS NOT NULL
      ),
      'premium_activated', (
        SELECT count(DISTINCT user_id) FROM public.analytics_events
        WHERE event_name = 'premium_activated' AND occurred_at >= p_since AND user_id IS NOT NULL
      )
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.analytics_summary(timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.analytics_summary(timestamptz) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_summary(timestamptz) TO service_role;

-- ─── 4. Daily rollup (long-term history, survives cleanup) ──

CREATE TABLE IF NOT EXISTS public.analytics_daily_metrics (
  metric_date DATE NOT NULL,
  metric_key TEXT NOT NULL,
  value_numeric BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (metric_date, metric_key)
);

ALTER TABLE public.analytics_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view daily metrics" ON public.analytics_daily_metrics
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE OR REPLACE FUNCTION public.refresh_analytics_daily_metrics(p_day date DEFAULT (now()::date - 1))
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.analytics_daily_metrics (metric_date, metric_key, value_numeric)
  SELECT p_day, m.key, m.value FROM (
    VALUES
      ('page_views', (
        SELECT count(*) FROM public.analytics_events
        WHERE event_name = 'page_view' AND occurred_at::date = p_day
      )),
      ('unique_visitors', (
        SELECT count(DISTINCT session_id) FROM public.analytics_events
        WHERE event_name = 'page_view' AND occurred_at::date = p_day AND session_id IS NOT NULL
      )),
      ('registrations', (
        SELECT count(*) FROM public.users WHERE created_at::date = p_day
      )),
      ('attempts_started', (
        SELECT count(*) FROM public.simulation_attempts WHERE started_at::date = p_day
      )),
      ('attempts_completed', (
        SELECT count(*) FROM public.simulation_attempts
        WHERE status = 'completed' AND completed_at::date = p_day
      )),
      ('premium_activations', (
        SELECT count(*) FROM public.premium_subscriptions WHERE created_at::date = p_day
      ))
  ) AS m(key, value)
  ON CONFLICT (metric_date, metric_key)
  DO UPDATE SET value_numeric = EXCLUDED.value_numeric;
$$;

-- ─── 5. Retention cleanup (raw events) ──────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_analytics_events(p_keep_days integer DEFAULT 180)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.analytics_events
  WHERE occurred_at < now() - make_interval(days => GREATEST(p_keep_days, 30));
$$;

-- ─── 6. Suggested Supabase cron jobs (pg_cron) ──────────────
-- Enable the pg_cron extension in Supabase, then run:
--
--   SELECT cron.schedule(
--     'analytics-daily-rollup', '10 0 * * *',
--     $cron$ SELECT public.refresh_analytics_daily_metrics(); $cron$
--   );
--
--   SELECT cron.schedule(
--     'analytics-retention-cleanup', '30 3 * * 0',
--     $cron$ SELECT public.cleanup_analytics_events(180); $cron$
--   );
