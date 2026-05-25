create table
if not exists fund_loans
(
  id uuid primary key default gen_random_uuid
(),
  company_id uuid not null references companies
(id) on
delete cascade,
  member_id uuid
not null references fund_members
(id) on
delete restrict,
  cycle_id uuid
not null references fund_cycles
(id) on
delete restrict,
  principal_amount numeric(14, 2)
not null check
(principal_amount > 0),
  interest_rate numeric
(8, 4) not null default 0 check
(interest_rate >= 0),
  total_amount numeric
(14, 2) not null check
(total_amount >= 0),
  installment_count integer not null check
(installment_count > 0),
  installment_value numeric
(14, 2) not null check
(installment_value >= 0),
  outstanding_balance numeric
(14, 2) not null check
(outstanding_balance >= 0),
  status varchar
(20) not null default 'draft' check
(status in
('draft', 'approved', 'active', 'paid', 'overdue', 'cancelled')),
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now
(),
  updated_at timestamptz not null default now
(),
  deleted_at timestamptz
);

create table
if not exists fund_loan_installments
(
  id uuid primary key default gen_random_uuid
(),
  company_id uuid not null references companies
(id) on
delete cascade,
  loan_id uuid
not null references fund_loans
(id) on
delete cascade,
  member_id uuid
not null references fund_members
(id) on
delete restrict,
  cycle_id uuid
not null references fund_cycles
(id) on
delete restrict,
  installment_number integer
not null check
(installment_number > 0),
  due_date date not null,
  expected_amount numeric
(14, 2) not null check
(expected_amount >= 0),
  paid_amount numeric
(14, 2) not null default 0 check
(paid_amount >= 0),
  pending_amount numeric
(14, 2) not null check
(pending_amount >= 0),
  status varchar
(20) not null default 'pending' check
(status in
('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_date date,
  payment_method varchar
(60),
  notes text,
  created_at timestamptz not null default now
(),
  updated_at timestamptz not null default now
(),
  deleted_at timestamptz,
  unique
(loan_id, installment_number)
);

create index
if not exists idx_fund_loans_company_status
  on fund_loans
(company_id, status)
  where deleted_at is null;

create index
if not exists idx_fund_loans_member_cycle
  on fund_loans
(company_id, member_id, cycle_id)
  where deleted_at is null;

create index
if not exists idx_fund_loan_installments_company_due
  on fund_loan_installments
(company_id, due_date, status)
  where deleted_at is null;

create index
if not exists idx_fund_loan_installments_loan_status
  on fund_loan_installments
(loan_id, status)
  where deleted_at is null;
