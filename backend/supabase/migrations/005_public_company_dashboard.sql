alter table companies
  add column if not exists public_dashboard_enabled boolean not null default false,
  add column if not exists public_slug varchar(150);

update companies
set public_slug = slug
where public_slug is null;

alter table companies
  drop constraint if exists companies_public_slug_format_check;

alter table companies
  add constraint companies_public_slug_format_check
  check (
    public_slug is null
    or public_slug ~ '^[a-z0-9-]+$'
  );

create unique index if not exists idx_companies_public_slug_unique
  on companies(public_slug)
  where public_slug is not null;

create index if not exists idx_companies_public_dashboard_enabled
  on companies(public_dashboard_enabled)
  where public_dashboard_enabled = true;
