# Fitness Routine Detail Experience

## Objetivo

Crear una experiencia completa para visualizar una rutina fitness con estructura detallada, métricas reales y navegación interna por semanas.

## Componentes creados

- `frontend/src/fitness/pages/FitnessRoutineTemplateDetailPage.jsx`
- `frontend/src/fitness/components/routines/RoutineWeekCard.jsx`
- `frontend/src/fitness/components/routines/RoutineDayCard.jsx`
- `frontend/src/fitness/components/routines/RoutineExerciseCard.jsx`
- `frontend/src/fitness/components/routines/RoutineStructureSidebar.jsx`
- `frontend/src/fitness/components/routines/RoutineMetricCard.jsx`

## Ruta

- `/fitness/routines/:id`

## API usada

- `getRoutineTemplateById(companyId, templateId)`
- `getRoutineTemplateStructure(companyId, templateId)`

## Experiencia renderizada

La página muestra:

- header con nombre, objetivo, nivel, duración y badges
- métricas reales:
  - semanas
  - días
  - ejercicios
  - promedio de ejercicios por día
- sidebar sticky con navegación por semanas
- estructura real:
  - semana
  - días
  - ejercicios

Cada ejercicio muestra:

- `name`
- `category`
- `muscle_group`
- `sets`
- `reps`
- `rest_seconds`
- `sort_order`
- `equipment`
- `difficulty`

## UX

- cards modernas
- jerarquía visual clara
- layout responsive básico
- loading state
- error state
- empty state
- sticky sidebar
- expand/collapse por semana

## Seguridad

- no se toca EMAUS dashboard
- no se modifican finanzas
- no se reemplaza AppShell global
- no se activa RLS
- no se toca producción
- tenant safety mantenido
- fallback seguro mantenido
- `companyId` controlado por `useFitnessCompanyScope`
