alter table companies
  add column if not exists valor_objetivo_emaus numeric(14, 2) not null default 460000;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  document_number varchar(40) not null,
  full_name varchar(180) not null,
  phone varchar(40),
  email varchar(150),
  target_amount numeric(14, 2) not null default 460000 check (target_amount >= 0),
  total_paid numeric(14, 2) not null default 0 check (total_paid >= 0),
  pending_balance numeric(14, 2) not null default 460000,
  payment_status varchar(20) not null default 'pending' check (payment_status in ('pending', 'partial', 'completed')),
  observations text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, document_number)
);

alter table incomes
  add column if not exists participant_id uuid references participants(id) on delete restrict,
  add column if not exists installment_number integer,
  add column if not exists receipt_number varchar(80);

alter table expenses
  add column if not exists authorized_by varchar(150),
  add column if not exists receipt_reference varchar(120);

create index if not exists idx_participants_company_payment_status
  on participants(company_id, payment_status, active)
  where deleted_at is null;

create index if not exists idx_participants_company_name_document
  on participants(company_id, lower(full_name), lower(document_number))
  where deleted_at is null;

create index if not exists idx_incomes_company_participant
  on incomes(company_id, participant_id, movement_date desc)
  where deleted_at is null;

create unique index if not exists idx_incomes_company_receipt_unique
  on incomes(company_id, receipt_number)
  where deleted_at is null and receipt_number is not null;

create index if not exists idx_expenses_company_authorized
  on expenses(company_id, lower(coalesce(authorized_by, '')))
  where deleted_at is null;

create or replace function recalculate_participant_totals(p_participant_id uuid)
returns void
language plpgsql
as $$
declare
  v_total_paid numeric(14, 2);
  v_target_amount numeric(14, 2);
  v_pending_balance numeric(14, 2);
  v_payment_status varchar(20);
begin
  if p_participant_id is null then
    return;
  end if;

  select target_amount
    into v_target_amount
  from participants
  where id = p_participant_id and deleted_at is null;

  if v_target_amount is null then
    return;
  end if;

  select coalesce(sum(amount), 0)
    into v_total_paid
  from incomes
  where participant_id = p_participant_id
    and deleted_at is null
    and status = 'completed';

  v_pending_balance := greatest(v_target_amount - v_total_paid, 0);

  if v_total_paid <= 0 then
    v_payment_status := 'pending';
  elsif v_total_paid >= v_target_amount then
    v_payment_status := 'completed';
  else
    v_payment_status := 'partial';
  end if;

  update participants
  set total_paid = v_total_paid,
      pending_balance = v_pending_balance,
      payment_status = v_payment_status,
      updated_at = now()
  where id = p_participant_id;
end;
$$;

create or replace function sync_participant_totals_from_incomes()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform recalculate_participant_totals(new.participant_id);
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    perform recalculate_participant_totals(old.participant_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_incomes_sync_participant_totals on incomes;

create trigger trg_incomes_sync_participant_totals
after insert or update or delete on incomes
for each row
execute function sync_participant_totals_from_incomes();
