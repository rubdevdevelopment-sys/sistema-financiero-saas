# Fitness Core API Routes

## Objetivo

Exponer rutas API aisladas para consultar Fitness Core sin tocar finanzas, sin activar wiring global riesgoso y sin abrir rutas publicas nuevas.

## Rutas creadas

- `backend/src/fitness/trainers/trainers.routes.js`
- `backend/src/fitness/clients/fitness-clients.routes.js`
- `backend/src/fitness/exercises/exercises.routes.js`
- `backend/src/fitness/routines/routine-templates.routes.js`
- `backend/src/fitness/fitness.routes.js`

## Endpoints

- `GET /api/fitness/trainers`
- `GET /api/fitness/trainers/:id`
- `GET /api/fitness/clients`
- `GET /api/fitness/clients/:id`
- `GET /api/fitness/exercises`
- `GET /api/fitness/exercises/:id`
- `GET /api/fitness/routine-templates`
- `GET /api/fitness/routine-templates/:id`
- `GET /api/fitness/routine-templates/:id/structure`

## Scope temporal por tenant

Estas rutas usan `companyId` temporal desde:

- query param `companyId`
- header `x-company-id`

## Postura de seguridad

- las rutas quedan protegidas por `authMiddleware` existente
- no se cambio auth
- no se agregaron controladores publicos
- no se modifico `app.js`
- el montaje minimo se hizo en `backend/src/routes/index.js`
- si falta `companyId`, la respuesta es segura
- si un usuario no `super_admin` intenta otro `companyId`, la respuesta es segura
- todos los datos siguen filtrando por `company_id`
- todos los servicios siguen excluyendo `deleted_at is not null`

## Respuesta segura

Comportamiento cuando falta o no aplica `companyId`:

- endpoints de listado devuelven `[]`
- endpoints de detalle devuelven `null`

## Validacion staging-only

Script:

- `backend/scripts/validate-staging-fitness-api.js`

El validador:

- carga `backend/.env.staging` antes de importar la app
- inicia un servidor temporal en memoria
- hace login con el usuario demo de staging
- consulta los endpoints fitness contra `rubdev-demo-company`
- valida listados, `getById` y `structure`
- valida respuestas seguras sin imprimir secretos

## Ejecucion

Desde `backend/`:

```bash
node --check src/fitness/fitness-route.utils.js
node --check src/fitness/trainers/trainers.routes.js
node --check src/fitness/clients/fitness-clients.routes.js
node --check src/fitness/exercises/exercises.routes.js
node --check src/fitness/routines/routine-templates.routes.js
node --check src/fitness/fitness.routes.js
node --check scripts/validate-staging-fitness-api.js
node scripts/validate-staging-fitness-api.js
```

## No objetivos

- no controladores dedicados en esta fase
- no mutaciones create/update/delete
- no cambios de finanzas
- no cambios de EMAUS
- no activacion de RLS
