# Foundation Develop Merge Plan

## Branch

- Source branch: `feature/foundation-enterprise-core`
- Target branch under consideration: `develop`
- `main` merge: blocked
- production rollout: blocked

## Objective

Define a safe merge strategy so Foundation Enterprise v1 can move into `develop` as disconnected infrastructure, documentation, staging tooling, and isolated validation assets without changing current production behavior.

## Current validated scope

The following scope has already been prepared and validated:

- foundation directory structure
- additive migrations `011`, `012`, `013`
- foundation backend services
- foundation middleware and validator
- foundation runtime preparation services
- frontend foundation providers and hooks
- staging environment setup strategy
- staging provisioning and migration validation
- staging seed data
- backend foundation validation
- frontend isolated validation sandbox
- final architectural and safety review

## Allowed merge scope into develop

The following is safe to merge into `develop` now:

- additive foundation migrations:
  - `011_company_settings_foundation.sql`
  - `012_company_branding_foundation.sql`
  - `013_company_features_foundation.sql`
- backend foundation services and runtime preparation:
  - `backend/src/settings/*`
  - `backend/src/branding/*`
  - `backend/src/features/*`
  - `backend/src/tenant/*`
  - `backend/src/permissions/*`
  - `backend/src/foundation/*`
- frontend foundation-only providers, hooks and sandbox:
  - `frontend/src/foundation/providers/*`
  - `frontend/src/foundation/hooks/*`
  - `frontend/src/foundation/dev/FoundationRuntimeSandbox.jsx`
- staging-only scripts:
  - `backend/scripts/seed-staging-foundation.js`
  - `backend/scripts/validate-staging-foundation-runtime.js`
- foundation and staging documentation
- `.gitignore` hardening for environment protection
- `backend/.env.staging.example`

## Scope that must remain disconnected after merge

After merge into `develop`, the following must still remain disconnected:

- no provider mounting in `frontend/src/main.jsx`
- no foundation route wiring in `frontend/src/router.jsx`
- no activation in `backend/src/app.js`
- no activation in `backend/src/server.js`
- no controller imports that require foundation runtime
- no route imports that require foundation runtime
- no middleware registration for `tenantMiddleware`
- no ownership enforcement activation
- no replacement of `companies.timezone`
- no replacement of `companies.currency`
- no replacement of `company_modules` as active module gate
- no tenant isolation enforcement in shared runtime yet

## Scope that remains staging-only

The following must remain staging-only after merge:

- execution of migrations `001` through `013`
- staging seed execution
- staging runtime validation script
- use of `backend/.env.staging`
- demo company and demo user data
- staging documentation that references execution steps

These assets may exist in `develop`, but must not be automatically run or wired into shared runtime flows.

## Runtime restrictions after merge to develop

The following restrictions remain mandatory:

- do not wire foundation runtime globally
- do not mount foundation providers globally
- do not enable RLS as part of foundation merge
- do not modify auth behavior
- do not modify financial module behavior
- do not change EMAUS production behavior
- do not point runtime to `company_settings`, `company_branding`, or `company_features` as active sources yet
- do not add blocking feature guards to existing flows
- do not enable tenant middleware in the global request chain

## Post-merge validation checklist for develop

After merging into `develop`, validate:

- `develop` builds successfully in backend and frontend
- no import errors from foundation directories
- no startup/runtime failures in backend
- no frontend crash from disconnected providers or hooks
- no change in existing auth flows
- no change in existing finance flows
- no change in EMAUS-related business behavior
- no unexpected route registration
- no unexpected middleware activation
- no unexpected SQL execution in local/dev boot processes
- env protection rules still ignore local and staging secret files

## Rollback strategy if develop integration causes issues

If merge into `develop` produces unexpected issues, rollback should be limited and non-destructive:

1. Revert the merge commit from `develop` instead of editing `main`.
2. Keep staging database history unchanged unless a separate staging cleanup is explicitly required.
3. Do not remove production-safe migrations from git history ad hoc.
4. If the issue is documentation or script-only, revert only the affected commit subset where possible.
5. If the issue is import-related, disable the new references instead of refactoring active runtime areas.
6. Re-run backend syntax checks and frontend build after rollback.

## Future phases after develop merge

### Phase 4

- controlled runtime opt-in strategy
- explicit non-global integration points
- isolated internal endpoints for foundation reads if approved

### Phase 5

- tenant-aware runtime sequencing
- RBAC and ownership enforcement planning
- company-level feature governance rollout strategy

### Phase 6

- EMAUS-specific production safety review
- production rollback drill
- approved production activation plan

## Merge recommendations

### May merge into develop

- foundation preparation code
- disconnected frontend foundation assets
- disconnected backend foundation assets
- staging scripts
- migration files
- validation documentation

### Must NOT merge into main yet

- any global foundation runtime activation
- any provider mounting in entrypoints
- any route/controller/runtime coupling that changes current behavior
- any production environment activation plan
- any tenant enforcement activation
- any switch of current active company/module sources

## Decision statement

- Merge into `develop` may be considered after human review.
- Merge into `main` remains blocked.
- Production must remain untouched.
- EMAUS must remain protected under the current disconnected foundation approach.
