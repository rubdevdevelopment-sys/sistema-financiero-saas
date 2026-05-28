# Staging Fitness Core Validation

## Purpose

Validate the fitness foundation schema in staging without touching production, EMAUS production data, finance runtime behavior, or global application wiring.

## Script

- `backend/scripts/validate-staging-fitness-core.js`

## Safety rules

- use `backend/.env.staging` only
- do not use `backend/.env`
- do not print secrets
- do not insert data
- do not modify runtime code
- do not enable RLS
- do not touch production

## What the script validates

The script connects directly to the staging database and verifies:

- all 7 fitness tables exist
- required columns exist for each table
- `company_id` exists on all tenant-owned tables
- `created_at`, `updated_at`, and `deleted_at` exist on all tables
- RLS is disabled on the fitness foundation tables
- expected indexes created by `014_fitness_core_foundation.sql` exist

## Tables in scope

- `trainers`
- `fitness_clients`
- `exercises`
- `routine_templates`
- `routine_template_weeks`
- `routine_template_days`
- `routine_template_exercises`

## Execution

Run from `backend/`:

```bash
node scripts/validate-staging-fitness-core.js
node --check scripts/validate-staging-fitness-core.js
```

## Preconditions

- current branch is an approved staging branch such as `feature/foundation-enterprise-core`
- `backend/.env.staging` exists locally and is not committed
- `NODE_ENV=staging`
- `APP_ENV=staging`
- `DATABASE_URL` points to staging only
- migration `014_fitness_core_foundation.sql` has already been executed in staging

## Expected result

Successful execution returns a JSON summary that confirms:

- staging connection is valid
- all fitness schema tables exist
- required columns are present
- audit columns are present
- tenant ownership columns are present
- RLS remains disabled
- expected indexes exist

## Non-goals

- no seed data creation
- no production validation
- no fitness runtime activation
- no finance schema checks outside this isolated foundation scope
