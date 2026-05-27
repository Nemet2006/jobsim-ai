-- ============================================================
-- JobSim AI — Premium Subscription
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Subscription / payment records
CREATE TABLE IF NOT EXISTS public.premium_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  plan            TEXT NOT NULL DEFAULT 'premium',
  provider        TEXT NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe', 'promo', 'admin')),
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  promo_code      TEXT,
  amount_cents    INTEGER,
  currency        TEXT DEFAULT 'usd',
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_subs_user ON public.premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subs_stripe_session ON public.premium_subscriptions(stripe_session_id);

ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own subscriptions" ON public.premium_subscriptions;
CREATE POLICY "Users read own subscriptions" ON public.premium_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- 2. Prevent users from self-upgrading is_premium via client
CREATE OR REPLACE FUNCTION public.protect_is_premium_field()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    -- Only service_role (API/webhook) may change is_premium
    IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
      NEW.is_premium := OLD.is_premium;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_is_premium ON public.users;
CREATE TRIGGER protect_is_premium
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_is_premium_field();

-- 3. Helper: activate premium (called from service role only)
CREATE OR REPLACE FUNCTION public.activate_user_premium(
  p_user_id UUID,
  p_provider TEXT DEFAULT 'stripe',
  p_stripe_session_id TEXT DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL,
  p_promo_code TEXT DEFAULT NULL,
  p_amount_cents INTEGER DEFAULT NULL,
  p_currency TEXT DEFAULT 'usd',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users SET is_premium = TRUE WHERE id = p_user_id;

  INSERT INTO public.premium_subscriptions (
    user_id, status, plan, provider,
    stripe_session_id, stripe_payment_id, promo_code,
    amount_cents, currency, expires_at
  ) VALUES (
    p_user_id, 'active', 'premium', p_provider,
    p_stripe_session_id, p_stripe_payment_id, p_promo_code,
    p_amount_cents, p_currency, p_expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_user_premium TO service_role;
