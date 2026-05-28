# Fitness Core Backend Services

## Purpose

Provide tenant-safe backend data access services for the Fitness Core foundation layer without exposing routes, controllers, public runtime wiring, or production behavior.

## Services

- `backend/src/fitness/trainers/trainers.service.js`
- `backend/src/fitness/clients/fitness-clients.service.js`
- `backend/src/fitness/exercises/exercises.service.js`
- `backend/src/fitness/routines/routine-templates.service.js`

## Safety posture

- all queries require `companyId`
- missing `companyId` returns safe empty arrays or `null`
- all queries filter `deleted_at is null`
- all lookups are scoped by `company_id`
- no routes or controllers are added in this phase
- no runtime activation is added
- no RLS is enabled
- no finance modules are modified

## Service methods

### Trainers

- `listTrainers(companyId, filters)`
- `getTrainerById(companyId, trainerId)`

Supported safe filters:

- `search`
- `status`
- `specialization`
- `limit`

### Fitness clients

- `listFitnessClients(companyId, filters)`
- `getFitnessClientById(companyId, clientId)`

Supported safe filters:

- `search`
- `status`
- `assignedTrainerId`
- `limit`

### Exercises

- `listExercises(companyId, filters)`
- `getExerciseById(companyId, exerciseId)`

Supported safe filters:

- `search`
- `category`
- `muscleGroup`
- `difficulty`
- `isActive`
- `limit`

### Routine templates

- `listRoutineTemplates(companyId, filters)`
- `getRoutineTemplateById(companyId, templateId)`
- `getRoutineTemplateStructure(companyId, templateId)`

Supported safe filters:

- `search`
- `level`
- `goal`
- `isActive`
- `limit`

## Structure retrieval

`getRoutineTemplateStructure(companyId, templateId)` returns:

- the routine template
- ordered weeks
- ordered days inside each week
- ordered exercise assignments inside each day
- exercise summary metadata for each assignment

All nested retrieval remains tenant-scoped and excludes soft-deleted rows.

## Validation

Staging-only validation script:

- `backend/scripts/validate-staging-fitness-services.js`

The validator:

- loads `backend/.env.staging` only
- confirms staging environment values before service import
- finds demo company `rubdev-demo-company`
- validates all list methods
- validates all `getById` methods
- validates routine structure retrieval
- validates fallback behavior when `companyId` is missing
- avoids printing secrets

## Execution

Run from `backend/`:

```bash
node --check src/fitness/trainers/trainers.service.js
node --check src/fitness/clients/fitness-clients.service.js
node --check src/fitness/exercises/exercises.service.js
node --check src/fitness/routines/routine-templates.service.js
node --check scripts/validate-staging-fitness-services.js
node scripts/validate-staging-fitness-services.js
```

## Non-goals

- no create or update mutations
- no controllers
- no routes
- no auth expansion
- no frontend wiring
- no production validation
