# Fitness Core Data Architecture

## Purpose

Prepare the initial fitness data foundation as an additive, staging-first schema that does not modify existing finance behavior, production runtime wiring, or EMAUS production data.

## Scope

Migration file:

- `backend/supabase/migrations/014_fitness_core_foundation.sql`

Tables introduced:

- `trainers`
- `fitness_clients`
- `exercises`
- `routine_templates`
- `routine_template_weeks`
- `routine_template_days`
- `routine_template_exercises`

## Safety rules applied

- additive only migration
- no changes to finance tables
- no changes to EMAUS-specific tables
- no production data copy
- no runtime activation or module rewiring
- no RLS enablement
- staging-only validation via `backend/.env.staging`

## Design principles

### Tenant ownership

Every tenant-owned table includes `company_id` and a foreign key to `companies(id)`.

### Auditability

Each table includes:

- `created_at`
- `updated_at`
- `deleted_at`

The main authoring tables also include:

- `created_by`
- `updated_by`

These ownership fields reference `app_users(id)` with `on delete set null`.

### Soft delete posture

Soft delete is modeled with nullable `deleted_at`. Active-record uniqueness is enforced with partial unique indexes so records can be retired without losing historical traceability.

### Runtime isolation

This phase creates schema only. It does not connect new tables to routes, services, permissions, feature guards, or production runtime paths.

## Table overview

### `trainers`

Stores trainer identity and status per company.

Main fields:

- `name`
- `email`
- `phone`
- `specialization`
- `status`

Notes:

- email is optional
- active-email uniqueness is enforced per company

### `fitness_clients`

Stores client identity, goal, status, and trainer assignment per company.

Main fields:

- `name`
- `email`
- `phone`
- `goal`
- `status`
- `assigned_trainer_id`

Notes:

- trainer assignment uses a safe nullable foreign key to `trainers(id)`
- active-email uniqueness is enforced per company

### `exercises`

Stores reusable exercise definitions per company.

Main fields:

- `name`
- `description`
- `category`
- `muscle_group`
- `equipment`
- `difficulty`
- `video_url`
- `image_url`
- `is_active`

Notes:

- active-name uniqueness is enforced per company
- difficulty is constrained to `beginner`, `intermediate`, or `advanced` when provided

### `routine_templates`

Stores reusable routine blueprints per company.

Main fields:

- `name`
- `description`
- `level`
- `goal`
- `duration_weeks`
- `is_active`

### `routine_template_weeks`

Stores ordered weeks inside a template.

Main fields:

- `routine_template_id`
- `week_number`
- `name`
- `description`

Notes:

- `(company_id, routine_template_id)` foreign key keeps the week inside the same tenant as its parent template
- active week numbers are unique per template

### `routine_template_days`

Stores ordered days inside a routine week.

Main fields:

- `routine_template_week_id`
- `day_number`
- `name`
- `description`

Notes:

- `(company_id, routine_template_week_id)` foreign key keeps the day inside the same tenant as its parent week
- active day numbers are unique per week

### `routine_template_exercises`

Stores ordered exercise assignments inside a routine day.

Main fields:

- `routine_template_day_id`
- `exercise_id`
- `sort_order`
- `sets`
- `reps`
- `rest_seconds`
- `notes`

Notes:

- composite foreign keys enforce same-company linkage to both the routine day and the exercise
- active sort order is unique per routine day

## Index strategy

The migration adds:

- direct indexes on every `company_id`
- lookup indexes for status and active flags
- lookup indexes for trainer assignment, exercise category, and muscle group
- hierarchy indexes for template, week, day, and exercise traversal
- partial unique indexes for active records under soft delete

## Explicit non-goals for this phase

- no real fitness data insertion
- no client portal or trainer runtime logic
- no auth-role expansion
- no finance refactor
- no RLS policies
- no global provider or backend route activation

## Validation approach

Validation must be executed against staging only:

- use `backend/.env.staging`
- confirm `NODE_ENV=staging`
- confirm `APP_ENV=staging`
- confirm `DATABASE_URL` points to staging
- apply migration
- verify new tables exist

## Expected outcome

After execution in staging, the database should contain the seven new fitness foundation tables with their indexes and safe foreign keys, while production, EMAUS, finance behavior, and RLS posture remain unchanged.
