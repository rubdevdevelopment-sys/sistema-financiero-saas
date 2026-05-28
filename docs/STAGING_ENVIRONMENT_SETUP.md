# Staging Environment Setup

## Purpose

Define a safe way to prepare a staging environment for Phase 3 validation without exposing secrets and without touching production.

## Required files

- `backend/.env.staging.example`: committed template only
- `backend/.env.staging`: local real file, never committed

## Required staging variables

- `NODE_ENV`
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `APP_NAME`

## Safety rules

- Never place production values in `backend/.env.staging`.
- Never commit `backend/.env.staging`.
- Never use a staging file unless the Supabase project reference and database host are explicitly confirmed as staging.
- Never execute Phase 3 migrations while the target environment is ambiguous.

## Staging confirmation checklist

Before any migration execution, confirm all of the following:

1. `SUPABASE_URL` belongs to the staging Supabase project.
2. `DATABASE_URL` belongs to the staging database, not production.
3. The staging project reference is documented and reviewed.
4. The branch is `feature/foundation-enterprise-core` or another approved staging branch.
5. No production tenant, including EMAUS, is reachable from the selected credentials.

## Explicit non-goals

- no migration execution in this setup phase
- no SQL execution in this setup phase
- no production connectivity changes
- no runtime activation in this setup phase
