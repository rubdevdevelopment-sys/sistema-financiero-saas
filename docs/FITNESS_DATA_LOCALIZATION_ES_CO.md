# Fitness Data Localization ES-CO

## Objetivo

Dejar toda la experiencia visible del modulo Fitness en espanol ES-CO sin alterar la arquitectura, las APIs, los IDs ni los datos persistidos de staging.

## Decision aplicada

Se uso una capa de localizacion visible en frontend.

No se modifico el dataset persistido de staging y no fue necesario re-ejecutar el seed para esta fase.

## Enfoque

Se creo el helper:

- `frontend/src/fitness/utils/fitnessLocalization.js`

Este helper traduce unicamente valores visibles para la experiencia Fitness:

- nombres de ejercicios
- categorias
- grupos musculares
- equipos
- dificultad
- objetivos
- niveles
- nombres de rutinas
- estados visibles
- especializaciones de entrenadores
- objetivos demo de clientes

## Cobertura visual

Se conecto la localizacion en:

- `/fitness`
- `/fitness/exercises`
- `/fitness/routines`
- `/fitness/routines/:id`
- `/fitness/clients`
- `/fitness/trainers`

Tambien se ajusto la busqueda local para que encuentre coincidencias por los valores visibles ya traducidos.

## Seguridad

- no se tocaron datos de produccion
- no se afecto EMAUS
- no se modificaron finanzas
- no se activo RLS
- no se crearon migraciones
- no se cambiaron APIs
- no se rompieron IDs
- no se altero la arquitectura base

## Validacion

Se valido con:

```bash
node --check frontend/src/fitness/utils/fitnessLocalization.js
cd frontend
npm run build
```

## Nota

Si en una fase futura se decide persistir textos localizados en staging, debe hacerse con una actualizacion de seed controlada e idempotente. Para esta fase se priorizo la opcion mas segura: traduccion visible sin tocar el dataset.
