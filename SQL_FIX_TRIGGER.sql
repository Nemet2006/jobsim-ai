-- JobSim AI — handle_new_user trigger düzəlişi
-- Bu skripti SQL_FIX_POLICIES.sql-dən sonra (və ya əvəz olaraq) işə salın.

-- Köhnə trigger və funksiyanı sil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Yeni, təhlükəsiz trigger funksiyası
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role public.user_role;
  v_full_name text;
  v_university text;
  v_company text;
BEGIN
  -- Role-u təhlükəsiz parse et
  BEGIN
    v_role := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::public.user_role,
      'student'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student'::public.user_role;
  END;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_university := NULLIF(NEW.raw_user_meta_data->>'university', '');
  v_company := NULLIF(NEW.raw_user_meta_data->>'company_name', '');

  INSERT INTO public.users (id, email, full_name, role, university, company_name)
  VALUES (NEW.id, NEW.email, v_full_name, v_role, v_university, v_company)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = EXCLUDED.role,
    university = COALESCE(EXCLUDED.university, public.users.university),
    company_name = COALESCE(EXCLUDED.company_name, public.users.company_name);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Profil yaradıla bilməsə də, auth signup pozulmasın
    RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger-i yenidən yarat
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert policy-ni yenilə: trigger SECURITY DEFINER ilə işləyir, amma
-- istifadəçilər öz profillərini upsert edə bilməlidir
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
