-- Foundation migration: additive only.
-- Compatibility rule:
-- - Existing finance, EMAUS and foundation runtime behavior remain unchanged.
-- - These tables are a disconnected fitness foundation layer only.
-- - No automatic data migration, runtime wiring, RLS or production activation is performed here.
--
-- Safe rollback:
-- drop table if exists routine_template_exercises;
-- drop table if exists routine_template_days;
-- drop table if exists routine_template_weeks;
-- drop table if exists routine_templates;
-- drop table if exists fitness_clients;
-- drop table if exists exercises;
-- drop table if exists trainers;

create table if not exists trainers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(180) not null,
  email varchar(150),
  phone varchar(40),
  specialization varchar(160),
  status varchar(30) not null default 'active' check (status in ('active', 'inactive', 'on_leave')),
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_trainers_company_id_id unique (company_id, id)
);

create table if not exists fitness_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(180) not null,
  email varchar(150),
  phone varchar(40),
  goal text,
  status varchar(30) not null default 'active' check (status in ('lead', 'active', 'paused', 'inactive')),
  assigned_trainer_id uuid references trainers(id) on delete set null,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_fitness_clients_company_id_id unique (company_id, id)
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(160) not null,
  description text,
  category varchar(100),
  muscle_group varchar(100),
  equipment varchar(120),
  difficulty varchar(30) check (difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')),
  video_url text,
  image_url text,
  is_active boolean not null default true,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_exercises_company_id_id unique (company_id, id)
);

create table if not exists routine_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(180) not null,
  description text,
  level varchar(30) check (level is null or level in ('beginner', 'intermediate', 'advanced')),
  goal varchar(160),
  duration_weeks integer not null check (duration_weeks > 0),
  is_active boolean not null default true,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_routine_templates_company_id_id unique (company_id, id)
);

create table if not exists routine_template_weeks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  routine_template_id uuid not null,
  week_number integer not null check (week_number > 0),
  name varchar(160),
  description text,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_routine_template_weeks_company_id_id unique (company_id, id),
  constraint fk_routine_template_weeks_template
    foreign key (company_id, routine_template_id)
    references routine_templates(company_id, id)
    on delete cascade
);

create table if not exists routine_template_days (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  routine_template_week_id uuid not null,
  day_number integer not null check (day_number between 1 and 7),
  name varchar(160) not null,
  description text,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint uq_routine_template_days_company_id_id unique (company_id, id),
  constraint fk_routine_template_days_week
    foreign key (company_id, routine_template_week_id)
    references routine_template_weeks(company_id, id)
    on delete cascade
);

create table if not exists routine_template_exercises (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  routine_template_day_id uuid not null,
  exercise_id uuid not null,
  sort_order integer not null default 1 check (sort_order > 0),
  sets integer check (sets is null or sets > 0),
  reps varchar(40),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  notes text,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fk_routine_template_exercises_day
    foreign key (company_id, routine_template_day_id)
    references routine_template_days(company_id, id)
    on delete cascade,
  constraint fk_routine_template_exercises_exercise
    foreign key (company_id, exercise_id)
    references exercises(company_id, id)
    on delete restrict
);

create index if not exists idx_trainers_company_id
  on trainers(company_id);

create index if not exists idx_trainers_company_status
  on trainers(company_id, status)
  where deleted_at is null;

create unique index if not exists idx_trainers_company_email_active_unique
  on trainers(company_id, lower(email))
  where email is not null and deleted_at is null;

create index if not exists idx_fitness_clients_company_id
  on fitness_clients(company_id);

create index if not exists idx_fitness_clients_company_status
  on fitness_clients(company_id, status)
  where deleted_at is null;

create index if not exists idx_fitness_clients_company_trainer
  on fitness_clients(company_id, assigned_trainer_id)
  where deleted_at is null;

create unique index if not exists idx_fitness_clients_company_email_active_unique
  on fitness_clients(company_id, lower(email))
  where email is not null and deleted_at is null;

create index if not exists idx_exercises_company_id
  on exercises(company_id);

create index if not exists idx_exercises_company_active
  on exercises(company_id, is_active)
  where deleted_at is null;

create index if not exists idx_exercises_company_category
  on exercises(company_id, category)
  where deleted_at is null;

create index if not exists idx_exercises_company_muscle_group
  on exercises(company_id, muscle_group)
  where deleted_at is null;

create unique index if not exists idx_exercises_company_name_active_unique
  on exercises(company_id, lower(name))
  where deleted_at is null;

create index if not exists idx_routine_templates_company_id
  on routine_templates(company_id);

create index if not exists idx_routine_templates_company_active
  on routine_templates(company_id, is_active)
  where deleted_at is null;

create unique index if not exists idx_routine_templates_company_name_active_unique
  on routine_templates(company_id, lower(name))
  where deleted_at is null;

create index if not exists idx_routine_template_weeks_company_id
  on routine_template_weeks(company_id);

create index if not exists idx_routine_template_weeks_template
  on routine_template_weeks(company_id, routine_template_id)
  where deleted_at is null;

create unique index if not exists idx_routine_template_weeks_template_week_active
  on routine_template_weeks(routine_template_id, week_number)
  where deleted_at is null;

create index if not exists idx_routine_template_days_company_id
  on routine_template_days(company_id);

create index if not exists idx_routine_template_days_week
  on routine_template_days(company_id, routine_template_week_id)
  where deleted_at is null;

create unique index if not exists idx_routine_template_days_week_day_active
  on routine_template_days(routine_template_week_id, day_number)
  where deleted_at is null;

create index if not exists idx_routine_template_exercises_company_id
  on routine_template_exercises(company_id);

create index if not exists idx_routine_template_exercises_day
  on routine_template_exercises(company_id, routine_template_day_id, sort_order)
  where deleted_at is null;

create index if not exists idx_routine_template_exercises_exercise
  on routine_template_exercises(company_id, exercise_id)
  where deleted_at is null;

create unique index if not exists idx_routine_template_exercises_day_order_active
  on routine_template_exercises(routine_template_day_id, sort_order)
  where deleted_at is null;
