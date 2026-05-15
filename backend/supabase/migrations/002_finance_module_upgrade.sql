alter table categories
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references app_users(id) on delete set null;

alter table incomes
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references app_users(id) on delete set null;

alter table expenses
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references app_users(id) on delete set null;

create index if not exists idx_categories_company_type_active
  on categories(company_id, type, active)
  where deleted_at is null;

create index if not exists idx_categories_company_name_search
  on categories(company_id, lower(name))
  where deleted_at is null;

create index if not exists idx_incomes_company_filters
  on incomes(company_id, status, category_id, movement_date desc)
  where deleted_at is null;

create index if not exists idx_expenses_company_filters
  on expenses(company_id, status, category_id, movement_date desc)
  where deleted_at is null;

create index if not exists idx_incomes_company_text
  on incomes(company_id, lower(title), lower(coalesce(description, '')))
  where deleted_at is null;

create index if not exists idx_expenses_company_text
  on expenses(company_id, lower(title), lower(coalesce(description, '')))
  where deleted_at is null;
