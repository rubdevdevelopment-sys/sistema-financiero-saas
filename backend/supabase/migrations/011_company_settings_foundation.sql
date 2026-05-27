-- Foundation migration: additive only.
-- Compatibility rule:
-- - companies.timezone and companies.currency remain the active source for current production logic.
-- - This table is a complementary foundation layer only.
-- - No automatic data migration or query rewiring is performed here.
--
-- Safe rollback:
-- drop table if exists company_settings;

create table if not exists company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  timezone varchar(80),
  locale varchar(20),
  language varchar(20),
  currency varchar(10),
  date_format varchar(30),
  number_format varchar(30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_company_settings_company_id_unique
  on company_settings(company_id);
