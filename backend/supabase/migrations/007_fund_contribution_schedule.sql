alter table fund_contributions
  add column if not exists contribution_type varchar(30) not null default 'ordinary',
  add column if not exists due_date date,
  add column if not exists installment_order integer,
  add column if not exists quota_value_snapshot numeric(14, 2) not null default 0,
  add column if not exists generated_automatically boolean not null default true,
  add column if not exists title varchar(160);

update fund_contributions
set contribution_type = coalesce(contribution_type, 'ordinary'),
    due_date = coalesce(due_date, make_date(year, month, 10)),
    installment_order = coalesce(installment_order, month),
    quota_value_snapshot = coalesce(nullif(quota_value_snapshot, 0), expected_amount),
    title = coalesce(title, 'Cuota ordinaria ' || lpad(month::text, 2, '0') || '/' || year::text)
where due_date is null
   or installment_order is null
   or title is null
   or quota_value_snapshot = 0;

alter table fund_contributions
  alter column due_date set not null,
  alter column installment_order set not null,
  drop constraint if exists fund_contributions_contribution_type_check,
  add constraint fund_contributions_contribution_type_check
    check (contribution_type in ('ordinary', 'extraordinary', 'penalty')),
  drop constraint if exists fund_contributions_installment_order_check,
  add constraint fund_contributions_installment_order_check
    check (installment_order > 0),
  drop constraint if exists fund_contributions_quota_value_snapshot_check,
  add constraint fund_contributions_quota_value_snapshot_check
    check (quota_value_snapshot >= 0);

alter table fund_contributions
  drop constraint if exists fund_contributions_quota_assignment_id_month_year_key;

create unique index if not exists idx_fund_contributions_assignment_schedule_unique
  on fund_contributions(quota_assignment_id, contribution_type, installment_order, year)
  where deleted_at is null;

create index if not exists idx_fund_contributions_company_due_status
  on fund_contributions(company_id, due_date, status)
  where deleted_at is null;

create index if not exists idx_fund_contributions_company_type
  on fund_contributions(company_id, contribution_type)
  where deleted_at is null;
