# Expanded Fitness Demo Data

## Objetivo

Expandir significativamente los datos demo de Fitness Core en staging para simulaciones más realistas sin tocar producción, EMAUS, finanzas ni runtime wiring.

## Archivo actualizado

- `backend/scripts/seed-staging-fitness-core.js`

## Cobertura del catálogo demo

El seed expandido incluye ejercicios demo en estas áreas:

- pecho
- espalda
- piernas
- hombros
- brazos
- core
- cardio
- movilidad
- gluteos

También cubre variedad de dificultad:

- `beginner`
- `intermediate`
- `advanced`

Y variedad de equipo:

- `bodyweight`
- `dumbbell`
- `barbell`
- `machine`
- `bands`

## Plantillas demo incluidas

- `Beginner Full Body Demo`
- `Hypertrophy Upper Lower Demo`
- `Weight Loss Starter Demo`
- `Home Workout Demo`
- `Mobility Recovery Demo`
- `Strength Fundamentals Demo`
- `Women Lower Body Demo`
- `Functional Conditioning Demo`

## Estructura

Cada template incluye:

- semanas
- días
- ejercicios
- `sets`
- `reps`
- `rest_seconds`
- orden mediante `sort_order`

## Validación realizada

Se ejecutó el seed en staging usando `backend/.env.staging` únicamente.

Resultados finales confirmados:

- ejercicios: `54`
- templates: `8`
- semanas: `16`
- días: `32`
- asignaciones de ejercicios: `128`

## Idempotencia

La ejecución repetida del seed mantiene los mismos conteos y actualiza los mismos registros demo sin duplicarlos.

## Seguridad confirmada

- no se tocó producción
- no se afectó EMAUS
- no se usaron datos reales
- no se modificaron finanzas
- no se activó RLS
- no se imprimieron secretos
