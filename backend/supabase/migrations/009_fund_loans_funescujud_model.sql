alter table fund_loans
  add column if not exists monthly_interest_amount numeric(14, 2) not null default 0 check (monthly_interest_amount >= 0),
  add column if not exists total_interest numeric(14, 2) not null default 0 check (total_interest >= 0),
  add column if not exists total_payable numeric(14, 2) not null default 0 check (total_payable >= 0);

update fund_loans
set monthly_interest_amount = coalesce(nullif(monthly_interest_amount, 0), round((principal_amount * interest_rate / 100)::numeric, 2)),
    total_interest = coalesce(nullif(total_interest, 0), greatest(total_amount - principal_amount, 0)),
    total_payable = coalesce(nullif(total_payable, 0), total_amount)
where deleted_at is null;

alter table fund_loan_installments
  add column if not exists installment_type varchar(30) not null default 'interest_only';

alter table fund_loan_installments
  drop constraint if exists fund_loan_installments_installment_type_check,
  add constraint fund_loan_installments_installment_type_check
    check (installment_type in ('interest_only', 'final_settlement'));

update fund_loan_installments i
set installment_type = case
  when i.installment_number = l.installment_count then 'final_settlement'
  else 'interest_only'
end
from fund_loans l
where i.loan_id = l.id
  and i.deleted_at is null;

create index if not exists idx_fund_loan_installments_type
  on fund_loan_installments(company_id, installment_type)
  where deleted_at is null;
