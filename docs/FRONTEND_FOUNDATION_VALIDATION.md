# Frontend Foundation Validation

## Purpose

Validate foundation frontend providers and hooks in isolation without connecting them to the active runtime.

## Validated layers

- `TenantProvider`
- `SettingsProvider`
- `BrandingProvider`
- `FeatureProvider`
- `ThemeProvider`
- `useTenant`
- `useSettings`
- `useBranding`
- `useFeatures`

## Validation approach

- Providers keep safe defaults when no runtime data exists.
- Hooks read context safely from isolated providers.
- A sandbox component exists for local or future isolated validation:
  - `frontend/src/foundation/dev/FoundationRuntimeSandbox.jsx`

## Important runtime rule

- No provider was mounted in `frontend/src/main.jsx`.
- No global route was added by default.
- No auth flow was modified.
- No finance screen was modified.
- No feature blocking was activated globally.

## What the sandbox validates

- provider nesting stability
- tenant fallback rendering
- settings fallback rendering
- branding rendering
- feature flag rendering
- theme-derived preview values
- safe rendering with local seeded demo values only

## When to wire later

Global wiring should happen only after:

1. staging runtime activation plan
2. safe route strategy
3. EMAUS impact review
4. rollback path confirmation
