# Fitness Commercial Dashboard

## Alcance

Se creó la portada principal del workspace fitness en:

- `frontend/src/fitness/pages/FitnessDashboardPage.jsx`

Componentes nuevos:

- `frontend/src/fitness/components/dashboard/FitnessDashboardHero.jsx`
- `frontend/src/fitness/components/dashboard/FitnessDashboardMetricGrid.jsx`
- `frontend/src/fitness/components/dashboard/FitnessQuickActions.jsx`
- `frontend/src/fitness/components/dashboard/FitnessRecentClients.jsx`
- `frontend/src/fitness/components/dashboard/FitnessRoutineOverview.jsx`

## Ruta

- `/fitness`

## Datos mostrados

La portada usa APIs reales existentes:

- `listExercises`
- `listRoutineTemplates`
- `listFitnessClients`
- `listTrainers`

## Objetivo UX

- conectar visualmente clientes, rutinas y ejercicios
- servir como portada comercial y operativa del workspace
- mantener todos los textos visibles en español ES-CO
- preservar tenant safety y fallback seguro
