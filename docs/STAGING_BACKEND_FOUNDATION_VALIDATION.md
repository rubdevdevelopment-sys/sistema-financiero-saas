# Staging Backend Foundation Validation

## Purpose

Validate foundation backend services against staging data without connecting any foundation layer to the live runtime.

## Script

- `backend/scripts/validate-staging-foundation-runtime.js`

## Environment rule

- Use `backend/.env.staging` only.
- Never use `backend/.env` for this validation.
- Never point the validation script to production credentials.

## Validation scope

The validation script checks:

- staging connection health
- demo company lookup
- `settings.service.js`
- `branding.service.js`
- `features.service.js`
- `feature-guard.service.js`
- `foundation-runtime.service.js`
- safe fallback behavior for unknown company ids

## Safety rules

- no runtime wiring
- no auth changes
- no controller or route changes
- no financial module code changes
- no production data usage
- no RLS activation

## Expected behavior

- demo company settings are readable
- demo company branding is readable
- demo company features are readable
- feature guards match seeded staging values
- runtime snapshot builds successfully for demo company
- unknown company ids return safe fallback behavior
