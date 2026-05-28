# Fitness Frontend API Clients

## Objetivo

Crear clientes frontend aislados para consumir Fitness Core API sin crear pantallas, sin tocar el router y sin agregar wiring global.

## Archivos

- `frontend/src/fitness/api/fitnessApi.js`
- `frontend/src/fitness/api/trainersApi.js`
- `frontend/src/fitness/api/fitnessClientsApi.js`
- `frontend/src/fitness/api/exercisesApi.js`
- `frontend/src/fitness/api/routineTemplatesApi.js`
- `frontend/src/fitness/api/fitnessApi.validation.js`

## Patron reutilizado

Estos clientes reutilizan el cliente Axios existente en:

- `frontend/src/services/api.js`

Con esto:

- no se crea un cliente global nuevo
- no se modifica auth frontend
- no se toca routing
- no se afecta ningun modulo financiero

## Funciones disponibles

### Trainers

- `listTrainers(companyId, filters)`
- `getTrainerById(companyId, trainerId)`

### Fitness clients

- `listFitnessClients(companyId, filters)`
- `getFitnessClientById(companyId, clientId)`

### Exercises

- `listExercises(companyId, filters)`
- `getExerciseById(companyId, exerciseId)`

### Routine templates

- `listRoutineTemplates(companyId, filters)`
- `getRoutineTemplateById(companyId, templateId)`
- `getRoutineTemplateStructure(companyId, templateId)`

## Seguridad y fallbacks

- `companyId` viaja como query param temporal con la clave `companyId`
- si falta `companyId`, las funciones de listado devuelven `[]`
- si falta `companyId` o el id del recurso, las funciones de detalle devuelven `null`
- si la llamada HTTP falla, el fallback es seguro:
  - listados: `[]`
  - detalles: `null`

## Validacion

Archivo:

- `frontend/src/fitness/api/fitnessApi.validation.js`

Valida:

- construccion de URLs
- inclusion de `companyId`
- fallback cuando falta `companyId`

## Build

La validacion final debe incluir:

```bash
npm run build
```

## No objetivos

- no pantallas
- no cambios al router
- no wiring global
- no cambios productivos
