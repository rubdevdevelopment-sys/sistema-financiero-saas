create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  slug varchar(150) not null unique,
  nit varchar(50),
  email varchar(150),
  phone varchar(30),
  currency varchar(10) not null default 'COP',
  timezone varchar(80) not null default 'America/Bogota',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  full_name varchar(150) not null,
  email varchar(150) not null unique,
  password_hash text not null,
  role varchar(30) not null check (role in ('super_admin', 'admin', 'operator')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_modules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  module_key varchar(80) not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, module_key)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  type varchar(20) not null check (type in ('income', 'expense')),
  name varchar(120) not null,
  color varchar(20),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, type, name)
);

create table if not exists incomes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  title varchar(180) not null,
  description text,
  amount numeric(14, 2) not null check (amount > 0),
  movement_date date not null,
  payment_method varchar(60) not null,
  status varchar(20) not null check (status in ('pending', 'completed', 'cancelled')) default 'completed',
  attachment_url text,
  notes text,
  responsible varchar(120),
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  title varchar(180) not null,
  description text,
  amount numeric(14, 2) not null check (amount > 0),
  movement_date date not null,
  payment_method varchar(60) not null,
  status varchar(20) not null check (status in ('pending', 'completed', 'cancelled')) default 'completed',
  attachment_url text,
  notes text,
  responsible varchar(120),
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_users_company_id on app_users(company_id);
create index if not exists idx_categories_company_id_type on categories(company_id, type);
create index if not exists idx_incomes_company_date on incomes(company_id, movement_date desc);
create index if not exists idx_expenses_company_date on expenses(company_id, movement_date desc);
create index if not exists idx_incomes_company_status on incomes(company_id, status);
create index if not exists idx_expenses_company_status on expenses(company_id, status);
