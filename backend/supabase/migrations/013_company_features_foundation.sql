-- Foundation migration: additive only.
-- Compatibility rule:
-- - company_modules remains the active runtime structure for current module enablement.
-- - This table is a complementary enterprise foundation layer only.
-- - No automatic data migration, sync or runtime wiring is performed here.
--
-- Safe rollback:
-- drop table if exists company_features;

create table if not exists company_features (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  feature_key varchar(120) not null,
  enabled boolean not null default false,
  environment varchar(20),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_company_features_company_feature_env_unique
  on company_features(company_id, feature_key, environment);
