# Foundation Safe Runtime Rules

## Non-invasive rule

Foundation runtime preparation must not alter active behavior until an explicit activation phase is approved.

## Mandatory rules

- Do not wire foundation providers globally by default.
- Do not wire foundation backend services into active routes by default.
- Do not replace `company_modules` yet.
- Do not replace `companies.timezone` or `companies.currency` yet.
- Do not make requests fail when foundation tables are absent.
- Do not block existing request flows when tenant context is unresolved.
- Do not introduce auth coupling before RBAC design is approved.
- Do not modify financial modules during foundation runtime preparation.

## Fallback rule

Every foundation runtime layer must prefer safe defaults over hard failure:

- unresolved tenant -> unresolved context
- missing settings -> companies fallback
- missing branding -> global visual fallback
- missing features -> empty list and disabled feature guard
- unavailable foundation source -> non-blocking safe response

## EMAUS protection rule

- EMAUS remains on the existing production-safe path.
- No active runtime source must be switched to foundation tables without staged verification.
- Tenant leakage prevention takes priority over convenience.

## Activation rule

Any future runtime activation must happen in this order:

1. isolated staging activation
2. compatibility validation
3. tenant isolation validation
4. EMAUS safety review
5. controlled production rollout
