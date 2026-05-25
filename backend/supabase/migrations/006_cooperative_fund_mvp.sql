alter table fund_cycles
  add column if not exists year integer,
  add column if not exists quota_value numeric(14, 2),
  add column if not exists monthly_contribution numeric(14, 2),
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists is_active boolean not null default false,
  add column if not exists notes text;

update fund_cycles
set year = coalesce(year, cycle_year),
    quota_value = coalesce(quota_value, share_value, 0),
    monthly_contribution = coalesce(monthly_contribution, monthly_contribution_per_share, 0),
    start_date = coalesce(start_date, starts_on),
    end_date = coalesce(end_date, ends_on),
    is_active = coalesce(is_active, status = 'active')
where year is null
   or quota_value is null
   or monthly_contribution is null
   or start_date is null
   or end_date is null;

alter table fund_cycles
  alter column year set not null,
  alter column quota_value set not null,
  alter column quota_value set default 0,
  alter column monthly_contribution set not null,
  alter column monthly_contribution set default 0,
  alter column start_date set not null,
  alter column end_date set not null;

alter table fund_cycles
  drop constraint if exists fund_cycles_year_positive_check,
  add constraint fund_cycles_year_positive_check check (year >= 2000),
  drop constraint if exists fund_cycles_quota_value_positive_check,
  add constraint fund_cycles_quota_value_positive_check check (quota_value >= 0),
  drop constraint if exists fund_cycles_monthly_contribution_positive_check,
  add constraint fund_cycles_monthly_contribution_positive_check check (monthly_contribution >= 0);

create unique index if not exists idx_fund_cycles_company_year_unique
  on fund_cycles(company_id, year)
  where deleted_at is null;

create unique index if not exists idx_fund_cycles_one_active_per_company
  on fund_cycles(company_id)
  where is_active = true and deleted_at is null;

create table if not exists fund_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  full_name varchar(180) not null,
  document_number varchar(40) not null,
  phone varchar(40),
  email varchar(150),
  address text,
  status varchar(20) not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, document_number)
);

create table if not exists fund_member_quotas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  member_id uuid not null references fund_members(id) on delete cascade,
  cycle_id uuid not null references fund_cycles(id) on delete cascade,
  quota_count integer not null check (quota_count > 0),
  monthly_payment numeric(14, 2) not null default 0 check (monthly_payment >= 0),
  total_expected numeric(14, 2) not null default 0 check (total_expected >= 0),
  status varchar(20) not null default 'active' check (status in ('active', 'inactive', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (member_id, cycle_id)
);

create table if not exists fund_contributions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  member_id uuid not null references fund_members(id) on delete cascade,
  cycle_id uuid not null references fund_cycles(id) on delete cascade,
  quota_assignment_id uuid not null references fund_member_quotas(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2000),
  expected_amount numeric(14, 2) not null default 0 check (expected_amount >= 0),
  paid_amount numeric(14, 2) not null default 0 check (paid_amount >= 0),
  pending_amount numeric(14, 2) not null default 0 check (pending_amount >= 0),
  status varchar(20) not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue')),
  payment_date date,
  payment_method varchar(60),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (quota_assignment_id, month, year)
);

create table if not exists fund_penalties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  member_id uuid not null references fund_members(id) on delete cascade,
  contribution_id uuid references fund_contributions(id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  reason text not null,
  status varchar(20) not null default 'pending' check (status in ('pending', 'paid', 'waived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_fund_members_company_status
  on fund_members(company_id, status)
  where deleted_at is null;

create index if not exists idx_fund_member_quotas_company_cycle
  on fund_member_quotas(company_id, cycle_id, status)
  where deleted_at is null;

create index if not exists idx_fund_contributions_company_period
  on fund_contributions(company_id, year, month, status)
  where deleted_at is null;

create index if not exists idx_fund_penalties_company_status
  on fund_penalties(company_id, status)
  where deleted_at is null;
