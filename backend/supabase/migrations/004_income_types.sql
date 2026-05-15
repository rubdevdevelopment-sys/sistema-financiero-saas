alter table incomes
  add column if not exists income_type varchar(30);

update incomes
set income_type = 'participant_payment'
where income_type is null;

alter table incomes
  alter column income_type set default 'participant_payment';

alter table incomes
  alter column income_type set not null;

alter table incomes
  drop constraint if exists incomes_income_type_check;

alter table incomes
  add constraint incomes_income_type_check
  check (income_type in ('participant_payment', 'donation', 'sponsorship', 'event_income', 'other'));

alter table incomes
  drop constraint if exists incomes_participant_required_check;

alter table incomes
  add constraint incomes_participant_required_check
  check (
    (income_type = 'participant_payment' and participant_id is not null)
    or
    (income_type <> 'participant_payment')
  );

create index if not exists idx_incomes_company_income_type
  on incomes(company_id, income_type, movement_date desc)
  where deleted_at is null;

create index if not exists idx_incomes_company_type_status
  on incomes(company_id, income_type, status)
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
    and income_type = 'participant_payment'
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
    if new.income_type = 'participant_payment' then
      perform recalculate_participant_totals(new.participant_id);
    end if;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    if old.income_type = 'participant_payment' then
      perform recalculate_participant_totals(old.participant_id);
    end if;
  end if;

  return coalesce(new, old);
end;
$$;
