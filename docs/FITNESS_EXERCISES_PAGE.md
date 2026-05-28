# Fitness Exercises Page

## Objetivo

Crear una pantalla aislada de solo lectura para listar ejercicios del modulo Fitness Foundation sin tocar dashboard EMAUS, sin modificar pantallas financieras y sin reemplazar UI productiva.

## Archivo

- `frontend/src/fitness/pages/FitnessExercisesPage.jsx`

## Componentes usados

- `FoundationPageLayout`
- `FoundationPageHeader`
- `FoundationCard`
- `FoundationBadge`
- `FoundationTable`
- `FoundationTableToolbar`

## Fuente de datos

- `listExercises(companyId, filters)` desde `frontend/src/fitness/api/exercisesApi.js`

## Comportamiento

- usa `companyId` desde `useActiveCompany()`
- si no existe empresa activa, muestra fallback seguro y no consulta la API
- usa loading state con `FoundationTable`
- usa error state con `FoundationCard`
- usa empty state con `FoundationTable`
- usa filtro local simple sobre los resultados ya cargados
- solo lectura, sin CRUD

## UI requerida

- titulo: `Fitness Exercises`
- subtitulo: `Ejercicios demo del modulo Fitness Foundation`
- columnas:
  - `name`
  - `category`
  - `muscle_group`
  - `equipment`
  - `difficulty`
  - `is_active`
- badges para `difficulty`
- badges para `is_active`

## Ruta

Se agrego una ruta aislada:

- `/fitness/exercises`

No se modifico la navegacion principal del `AppShell`.

## Seguridad

- no se toco dashboard EMAUS
- no se tocaron pantallas financieras
- no se reemplazo UI productiva
- no se agrego wiring global nuevo
- si falta `companyId`, la pantalla queda en fallback seguro
