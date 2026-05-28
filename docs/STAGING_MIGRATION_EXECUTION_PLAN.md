# Staging Migration Execution Plan

## Purpose

Define a safe future plan for executing foundation migrations in staging before any production consideration.

## Migrations in scope

1. `011_company_settings_foundation.sql`
2. `012_company_branding_foundation.sql`
3. `013_company_features_foundation.sql`

## Preconditions

- Branch reviewed and approved
- Staging database backup verified
- No runtime wiring enabled by default
- Validation checklist prepared for tenant isolation
- `SUPABASE_URL` explicitly confirmed as staging
- `DATABASE_URL` explicitly confirmed as staging
- Staging credentials loaded from a local non-committed file such as `backend/.env.staging`

## Execution order

1. Apply `011_company_settings_foundation.sql`
2. Verify table creation and rollback path
3. Apply `012_company_branding_foundation.sql`
4. Verify table creation and rollback path
5. Apply `013_company_features_foundation.sql`
6. Verify indexes, nullable behavior and compatibility

## Post-migration checks

- Existing login still works
- Existing company CRUD still works
- Existing financial modules still work
- Existing public dashboard still works
- No query depends on the new tables yet
- No runtime path fails if the new tables are empty

## Explicit non-goals

- no production execution in this phase
- no EMAUS production rollout in this phase
- no automatic backfill in this phase
- no global runtime activation in this phase

## Hard stop rule

Phase 3 migrations may run only after `SUPABASE_URL` and `DATABASE_URL` are verified as staging targets. If either value is ambiguous, migration execution must stop.
