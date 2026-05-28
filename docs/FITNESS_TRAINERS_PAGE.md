# Fitness Trainers Page

## Alcance

Se agrego la vista de entrenadores del workspace fitness en:

- `frontend/src/fitness/pages/FitnessTrainersPage.jsx`

Componentes nuevos:

- `frontend/src/fitness/components/trainers/FitnessTrainerCard.jsx`
- `frontend/src/fitness/components/trainers/FitnessTrainerTable.jsx`
- `frontend/src/fitness/components/trainers/FitnessTrainerStats.jsx`

## Ruta

- `/fitness/trainers`

## Fuente de datos

- `listTrainers(companyId)` como fuente principal
- `listFitnessClients(companyId)` para derivar clientes asignados demo

## UX

- textos visibles en espanol ES-CO
- solo lectura
- cards de entrenadores
- tabla con busqueda local
- metricas comerciales para el equipo
- fallback seguro cuando falta `companyId`
