-- Optional bilingual columns for simulations.
-- Catalog English copy also ships in code (src/i18n/catalog-en.ts),
-- so the product works without running this. Run in Supabase SQL editor
-- if you want persisted EN fields on the simulations table.

alter table public.simulations
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists role_type_en text,
  add column if not exists questions_en jsonb;
