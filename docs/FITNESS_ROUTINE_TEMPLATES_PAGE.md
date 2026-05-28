# Fitness Routine Templates Page

## Objetivo

Crear una pantalla aislada de solo lectura para visualizar templates de rutinas del modulo Fitness Foundation.

## Archivo

- `frontend/src/fitness/pages/FitnessRoutineTemplatesPage.jsx`

## Componentes usados

- `FoundationPageLayout`
- `FoundationPageHeader`
- `FoundationCard`
- `FoundationBadge`
- `FoundationTable`
- `FoundationTableToolbar`

## Fuente de datos

- `listRoutineTemplates(companyId)`
- `getRoutineTemplateStructure(companyId, templateId)`

## Comportamiento

- usa `companyId` desde `useActiveCompany()`
- si no existe empresa activa, entra en fallback seguro
- calcula metricas por template:
  - total weeks
  - total days
  - total exercises
- usa filtro local simple por nombre, objetivo y nivel
- solo lectura, sin CRUD

## UI

- titulo: `Fitness Routine Templates`
- subtitulo: `Plantillas demo del modulo Fitness Foundation`
- columnas:
  - `name`
  - `goal`
  - `level`
  - `duration_weeks`
  - `is_active`
  - `total weeks`
  - `total days`
  - `total exercises`

## Ruta

Se agrega una ruta aislada:

- `/fitness/routines`

No se modifica el menu principal.

## Seguridad

- no se toca EMAUS dashboard
- no se modifican pantallas financieras
- no se reemplaza UI productiva
- no se agrega navegacion agresiva
- no se agrega wiring global adicional
