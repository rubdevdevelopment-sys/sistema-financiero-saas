# Fitness Foundation Experience

## Objetivo

Separar visualmente la experiencia fitness del shell financiero EMAUS y corregir la carga real del dataset demo en `/fitness/*`.

## Causa raíz

La carga en `0` venía de dos factores combinados:

1. Las rutas `/fitness/*` estaban montadas dentro de `AppShell`, por lo que heredaban el shell financiero.
2. Para `super_admin` sin empresa activa seleccionada, `companyId` no quedaba resuelto y las páginas entraban en fallback seguro, devolviendo `[]` y métricas en `0`.

## Solución aplicada

- se creó un scope seguro específico para fitness en:
  - `frontend/src/fitness/hooks/useFitnessCompanyScope.js`
- el hook resuelve `companyId` así:
  - empresa activa si existe
  - empresa del usuario autenticado si no es `super_admin`
  - `rubdev-demo-company` de forma segura si es `super_admin` y no tiene empresa activa
- se sacaron las rutas fitness del `AppShell` financiero y se movieron a un layout independiente:
  - `frontend/src/fitness/layouts/FitnessAppLayout.jsx`

## Layout y componentes creados

- `frontend/src/fitness/layouts/FitnessAppLayout.jsx`
- `frontend/src/fitness/components/FitnessSidebar.jsx`
- `frontend/src/fitness/components/FitnessTopbar.jsx`
- `frontend/src/fitness/components/FitnessStatCard.jsx`
- `frontend/src/fitness/hooks/useFitnessCompanyScope.js`

## Páginas migradas

- `frontend/src/fitness/pages/FitnessExercisesPage.jsx`
- `frontend/src/fitness/pages/FitnessRoutineTemplatesPage.jsx`

## Rutas fitness

Rutas validadas y aisladas:

- `/fitness/exercises`
- `/fitness/routines`

No se modificó `AppShell` global y no se tocó el dashboard EMAUS.

## Métricas demo esperadas

Con el seed expandido y el scope corregido:

- ejercicios visibles: `54`
- templates visibles: `8`
- semanas demo: `16`
- días demo: `32`
- asignaciones demo: `128`

## Seguridad

- tenant safety mantenido
- fallback seguro mantenido si no se resuelve empresa
- sin bypass agresivo
- sin cambios a finanzas
- sin cambios a auth
- sin RLS
- sin producción
