# Staging Fitness Seed Data

## Purpose

Create safe, fake, and idempotent demo data for the Fitness Core schema in staging only.

## Script

- `backend/scripts/seed-staging-fitness-core.js`

## Environment rule

- use `backend/.env.staging` only
- never use `backend/.env`
- never run the script against production credentials

## Demo data scope

The seed creates or updates fake demo records for:

- trainers
- fitness clients
- exercises
- routine templates
- routine template weeks
- routine template days
- routine template exercises

## Demo records included

Trainers:

- `Laura Fitness Demo`
- `Carlos Strength Demo`

Clients:

- `Ana Client Demo`
- `Mateo Client Demo`

Exercises:

- `Squat`
- `Push Up`
- `Plank`
- `Jumping Jacks`
- `Dumbbell Row`
- `Hip Thrust`

Routine templates:

- `Beginner Full Body Demo`
- `Weight Loss Starter Demo`

## Safety rules

- no production data copy
- no EMAUS data copy
- no runtime activation
- no finance code changes
- no RLS changes
- no secret printing

## Idempotency

The script is safe to re-run because it updates existing demo rows when they already exist and inserts them only when missing.

Stable lookup keys used by the script:

- trainer email
- client email
- exercise name per company
- routine template name per company
- week number per template
- day number per week
- sort order per routine day

## Validation counts

After seeding, the script reports counts for:

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
node --check scripts/seed-staging-fitness-core.js
node scripts/seed-staging-fitness-core.js
```

## Preconditions

- current branch is an approved staging branch such as `feature/foundation-enterprise-core`
- `backend/.env.staging` exists locally and is not committed
- `NODE_ENV=staging`
- `APP_ENV=staging`
- `DATABASE_URL` points to staging only
- migration `014_fitness_core_foundation.sql` has already been executed
- the demo company `rubdev-demo-company` already exists in staging

## Non-goals

- no real user data
- no production seeding
- no runtime route activation
- no finance module mutation
