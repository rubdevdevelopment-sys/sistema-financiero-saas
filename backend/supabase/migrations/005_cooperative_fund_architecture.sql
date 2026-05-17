alter table companies
  add column if not exists business_model varchar(40) not null default 'standard';

alter table companies
  drop constraint if exists companies_business_model_check;

alter table companies
  add constraint companies_business_model_check
  check (
    business_model in (
      'standard',
      'cooperative_fund',
      'investment_fund',
      'rotating_capital',
      'lending_group'
    )
  );

create table if not exists fund_cycles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(140) not null,
  cycle_year integer not null check (cycle_year >= 2000),
  starts_on date not null,
  ends_on date not null,
  share_value numeric(14, 2) not null default 0 check (share_value >= 0),
  monthly_contribution_per_share numeric(14, 2) not null default 0 check (monthly_contribution_per_share >= 0),
  status varchar(30) not null default 'draft' check (status in ('draft', 'active', 'settlement', 'closed')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, cycle_year)
);

create table if not exists fund_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  participant_id uuid references participants(id) on delete set null,
  member_code varchar(80),
  full_name varchar(180) not null,
  document_number varchar(40),
  phone varchar(40),
  email varchar(150),
  status varchar(30) not null default 'active' check (status in ('active', 'inactive', 'suspended', 'withdrawn')),
  joined_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, member_code),
  unique (company_id, document_number)
);

create table if not exists fund_shares (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  cycle_id uuid not null references fund_cycles(id) on delete cascade,
  membership_id uuid not null references fund_memberships(id) on delete cascade,
  shares_count numeric(12, 2) not null default 1 check (shares_count > 0),
  monthly_contribution numeric(14, 2) not null default 0 check (monthly_contribution >= 0),
  status varchar(30) not null default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (cycle_id, membership_id)
);

create table if not exists loan_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  cycle_id uuid references fund_cycles(id) on delete set null,
  membership_id uuid references fund_memberships(id) on delete set null,
  code varchar(80),
  principal_amount numeric(14, 2) not null default 0 check (principal_amount >= 0),
  outstanding_balance numeric(14, 2) not null default 0 check (outstanding_balance >= 0),
  monthly_interest_rate numeric(8, 4) not null default 0 check (monthly_interest_rate >= 0),
  starts_on date,
  due_on date,
  status varchar(30) not null default 'draft' check (status in ('draft', 'active', 'paid', 'defaulted', 'cancelled')),
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, code)
);

create table if not exists installment_schedules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  loan_account_id uuid not null references loan_accounts(id) on delete cascade,
  installment_number integer not null check (installment_number > 0),
  due_date date not null,
  principal_amount numeric(14, 2) not null default 0 check (principal_amount >= 0),
  interest_amount numeric(14, 2) not null default 0 check (interest_amount >= 0),
  penalty_amount numeric(14, 2) not null default 0 check (penalty_amount >= 0),
  paid_amount numeric(14, 2) not null default 0 check (paid_amount >= 0),
  status varchar(30) not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (loan_account_id, installment_number)
);

create table if not exists penalties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  cycle_id uuid references fund_cycles(id) on delete set null,
  membership_id uuid references fund_memberships(id) on delete set null,
  loan_account_id uuid references loan_accounts(id) on delete set null,
  penalty_type varchar(30) not null check (penalty_type in ('late_fee', 'fixed', 'percentage', 'interest_arrears')),
  base_amount numeric(14, 2) not null default 0 check (base_amount >= 0),
  penalty_amount numeric(14, 2) not null default 0 check (penalty_amount >= 0),
  applied_on date not null default current_date,
  status varchar(30) not null default 'pending' check (status in ('pending', 'paid', 'waived', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  cycle_id uuid not null references fund_cycles(id) on delete cascade,
  total_capital numeric(14, 2) not null default 0 check (total_capital >= 0),
  total_yields numeric(14, 2) not null default 0,
  total_expenses numeric(14, 2) not null default 0 check (total_expenses >= 0),
  active_portfolio numeric(14, 2) not null default 0 check (active_portfolio >= 0),
  available_cash numeric(14, 2) not null default 0,
  total_shares numeric(14, 2) not null default 0 check (total_shares >= 0),
  status varchar(30) not null default 'draft' check (status in ('draft', 'approved', 'distributed', 'cancelled')),
  calculated_at timestamptz,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (cycle_id)
);

create table if not exists distributions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  settlement_id uuid not null references settlements(id) on delete cascade,
  membership_id uuid not null references fund_memberships(id) on delete cascade,
  shares_count numeric(12, 2) not null default 0 check (shares_count >= 0),
  ownership_percentage numeric(8, 4) not null default 0 check (ownership_percentage >= 0),
  distribution_amount numeric(14, 2) not null default 0,
  status varchar(30) not null default 'pending' check (status in ('pending', 'paid', 'retained', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (settlement_id, membership_id)
);

create index if not exists idx_companies_business_model on companies(business_model);
create index if not exists idx_fund_cycles_company_status on fund_cycles(company_id, status) where deleted_at is null;
create index if not exists idx_fund_memberships_company_status on fund_memberships(company_id, status) where deleted_at is null;
create index if not exists idx_fund_shares_cycle_member on fund_shares(cycle_id, membership_id) where deleted_at is null;
create index if not exists idx_loan_accounts_company_status on loan_accounts(company_id, status) where deleted_at is null;
create index if not exists idx_installment_schedules_loan_status on installment_schedules(loan_account_id, status) where deleted_at is null;
create index if not exists idx_penalties_company_status on penalties(company_id, status) where deleted_at is null;
create index if not exists idx_settlements_company_cycle on settlements(company_id, cycle_id) where deleted_at is null;
create index if not exists idx_distributions_settlement_status on distributions(settlement_id, status) where deleted_at is null;
