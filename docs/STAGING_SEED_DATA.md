# Staging Seed Data

## Purpose

Create safe, fake and idempotent demo data for staging only after the staging schema is already provisioned.

## Script

- `backend/scripts/seed-staging-foundation.js`

## Environment rule

- Use `backend/.env.staging` only.
- Never use `backend/.env` for staging seed execution.
- Never run the staging seed against production credentials.

## Demo data scope

The seed creates or updates only fake data:

- company: `RubDev Demo Company`
- user: `demo@rubdev.test`
- modules: `finance`, `fitness`
- settings: `America/Bogota`, `COP`, `es-CO`
- branding: placeholder logo/favicon URLs and demo colors
- features:
  - `finance` enabled
  - `fitness` enabled
  - `reports` disabled
  - `ai` disabled

## Safety rules

- no production data copy
- no EMAUS data copy
- no runtime activation
- no auth flow changes
- no financial module code changes
- no RLS changes

## Idempotency

The seed is safe to re-run because it uses upsert behavior for:

- `companies`
- `app_users`
- `company_modules`
- `company_settings`
- `company_branding`
- `company_features`
