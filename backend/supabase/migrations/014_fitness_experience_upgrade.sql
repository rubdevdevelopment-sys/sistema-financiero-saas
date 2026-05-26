alter table companies
  add column if not exists fitness_settings jsonb not null default '{}'::jsonb;

alter table fitness_clients
  add column if not exists avatar_url text,
  add column if not exists membership_type varchar(40) not null default 'monthly',
  add column if not exists custom_membership_label varchar(120),
  add column if not exists membership_starts_on date,
  add column if not exists membership_ends_on date,
  add column if not exists birth_date date,
  add column if not exists gender varchar(30),
  add column if not exists body_fat_percentage numeric(5, 2),
  add column if not exists muscle_mass_kg numeric(6, 2),
  add column if not exists bmi numeric(5, 2),
  add column if not exists medical_notes text,
  add column if not exists fitness_objectives text;

alter table fitness_clients
  drop constraint if exists fitness_clients_membership_type_check;

alter table fitness_clients
  add constraint fitness_clients_membership_type_check
  check (
    membership_type in (
      'daily',
      'weekly',
      'monthly',
      'quarterly',
      'semiannual',
      'annual',
      'custom'
    )
  );

alter table fitness_clients
  drop constraint if exists fitness_clients_gender_check;

alter table fitness_clients
  add constraint fitness_clients_gender_check
  check (
    gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say', 'other')
  );

alter table exercises
  add column if not exists category varchar(80),
  add column if not exists difficulty varchar(30) not null default 'intermediate',
  add column if not exists thumbnail_url text;

alter table exercises
  drop constraint if exists exercises_difficulty_check;

alter table exercises
  add constraint exercises_difficulty_check
  check (difficulty in ('beginner', 'intermediate', 'advanced'));

alter table workout_day_exercises
  add column if not exists block_name varchar(120),
  add column if not exists block_type varchar(30) not null default 'straight',
  add column if not exists superset_group varchar(30);

alter table workout_day_exercises
  drop constraint if exists workout_day_exercises_block_type_check;

alter table workout_day_exercises
  add constraint workout_day_exercises_block_type_check
  check (block_type in ('straight', 'superset', 'circuit', 'finisher', 'mobility'));

alter table workout_logs
  add column if not exists progress_photo_url text;

create index if not exists idx_fitness_clients_membership_dates
  on fitness_clients(company_id, membership_ends_on)
  where deleted_at is null;

create index if not exists idx_exercises_company_category
  on exercises(company_id, category)
  where deleted_at is null;

create index if not exists idx_workout_logs_client_exercise
  on workout_logs(fitness_client_id, exercise_id, performed_on desc)
  where deleted_at is null;
