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
      'lending_group',
      'fitness'
    )
  );

create table if not exists fitness_clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid references app_users(id) on delete set null,
  full_name varchar(180) not null,
  email varchar(150),
  phone varchar(40),
  weight_kg numeric(6, 2) check (weight_kg is null or weight_kg > 0),
  height_cm numeric(6, 2) check (height_cm is null or height_cm > 0),
  goal text,
  experience_level varchar(30) not null default 'beginner' check (experience_level in ('beginner', 'intermediate', 'advanced')),
  injuries text,
  status varchar(30) not null default 'active' check (status in ('active', 'paused', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name varchar(160) not null,
  muscle_group varchar(80) not null,
  instructions text,
  equipment varchar(120),
  video_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, name)
);

create table if not exists workout_programs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  fitness_client_id uuid references fitness_clients(id) on delete set null,
  name varchar(180) not null,
  objective text,
  status varchar(30) not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  starts_on date,
  ends_on date,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists workout_weeks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  program_id uuid not null references workout_programs(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  focus varchar(160),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (program_id, week_number)
);

create table if not exists workout_days (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  week_id uuid not null references workout_weeks(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 7),
  name varchar(160) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (week_id, day_number)
);

create table if not exists workout_day_exercises (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  workout_day_id uuid not null references workout_days(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete restrict,
  exercise_order integer not null default 1 check (exercise_order > 0),
  planned_sets integer not null default 3 check (planned_sets > 0),
  planned_reps varchar(40) not null default '8-12',
  planned_weight numeric(7, 2) check (planned_weight is null or planned_weight >= 0),
  target_rir numeric(4, 1) check (target_rir is null or target_rir >= 0),
  target_rpe numeric(4, 1) check (target_rpe is null or target_rpe between 1 and 10),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  fitness_client_id uuid not null references fitness_clients(id) on delete cascade,
  program_id uuid references workout_programs(id) on delete set null,
  workout_day_id uuid references workout_days(id) on delete set null,
  workout_day_exercise_id uuid references workout_day_exercises(id) on delete set null,
  exercise_id uuid references exercises(id) on delete set null,
  performed_on date not null default current_date,
  status varchar(30) not null default 'completed' check (status in ('completed', 'partial', 'skipped')),
  sets_completed integer not null default 0 check (sets_completed >= 0),
  reps_completed integer not null default 0 check (reps_completed >= 0),
  weight_used numeric(7, 2) check (weight_used is null or weight_used >= 0),
  rir numeric(4, 1) check (rir is null or rir >= 0),
  rpe numeric(4, 1) check (rpe is null or rpe between 1 and 10),
  observations text,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_fitness_clients_company_status on fitness_clients(company_id, status) where deleted_at is null;
create index if not exists idx_exercises_company_muscle on exercises(company_id, muscle_group) where deleted_at is null;
create index if not exists idx_workout_programs_company_client on workout_programs(company_id, fitness_client_id) where deleted_at is null;
create index if not exists idx_workout_weeks_program on workout_weeks(program_id) where deleted_at is null;
create index if not exists idx_workout_days_week on workout_days(week_id) where deleted_at is null;
create index if not exists idx_workout_day_exercises_day on workout_day_exercises(workout_day_id, exercise_order) where deleted_at is null;
create index if not exists idx_workout_logs_company_date on workout_logs(company_id, performed_on desc) where deleted_at is null;
create index if not exists idx_workout_logs_client_date on workout_logs(fitness_client_id, performed_on desc) where deleted_at is null;
