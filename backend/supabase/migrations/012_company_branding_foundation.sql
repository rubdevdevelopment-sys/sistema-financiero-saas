-- Foundation migration: additive only.
-- Compatibility rule:
-- - Current frontend styles and global visual tokens remain the active runtime source.
-- - This table is a complementary foundation layer only.
-- - No automatic data migration, backfill or runtime wiring is performed here.
--
-- Safe rollback:
-- drop table if exists company_branding;

create table if not exists company_branding (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  logo_url text,
  favicon_url text,
  primary_color varchar(20),
  secondary_color varchar(20),
  accent_color varchar(20),
  background_color varchar(20),
  text_color varchar(20),
  dark_mode_enabled boolean,
  theme_name varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_company_branding_company_id_unique
  on company_branding(company_id);
