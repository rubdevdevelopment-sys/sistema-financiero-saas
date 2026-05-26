alter table workout_weeks
  drop constraint if exists workout_weeks_program_id_week_number_key;

alter table workout_days
  drop constraint if exists workout_days_week_id_day_number_key;

create unique index if not exists idx_workout_weeks_program_week_active
  on workout_weeks(program_id, week_number)
  where deleted_at is null;

create unique index if not exists idx_workout_days_week_day_active
  on workout_days(week_id, day_number)
  where deleted_at is null;
