# Foundation Runtime Preparation

## Objective

Prepare safe runtime layers for future enterprise activation without changing the active RubDev SaaS runtime.

## Scope of Phase 2

This phase adds isolated preparation modules only:

- backend foundation tenant context service
- backend foundation feature guard service
- backend foundation cache service
- backend foundation runtime service
- frontend foundation providers
- frontend foundation hooks
- safe defaults and fallback contracts

## Backend layers

- `backend/src/foundation/context/tenant-context.service.js`: resolves a safe tenant snapshot from request signals without changing auth.
- `backend/src/foundation/features/feature-guard.service.js`: prepares future feature enforcement using safe fallbacks.
- `backend/src/foundation/cache/foundation-cache.service.js`: provides lightweight in-memory cache for foundation snapshots.
- `backend/src/foundation/runtime/foundation-runtime.service.js`: aggregates safe tenant, settings, branding and feature data without global wiring.

## Frontend layers

- `frontend/src/foundation/providers/*`: isolated providers with safe defaults.
- `frontend/src/foundation/hooks/*`: foundation hooks that read isolated provider state only.

## Safety model

- No provider is wired into `frontend/src/main.jsx`.
- No backend foundation runtime service is wired into routes or `app.js`.
- No migration is executed in this phase.
- No auth flow is changed.
- No financial module is changed.
- EMAUS remains on the current runtime path.

## Fallback-first behavior

- Settings fall back to `companies.timezone` and `companies.currency`.
- Branding falls back to global RubDev-safe colors and theme name.
- Features fall back to an empty list and disabled access state.
- Tenant context falls back to unresolved context without blocking requests.

## Result

The project is prepared for a later staged activation path while keeping the current runtime unchanged.
