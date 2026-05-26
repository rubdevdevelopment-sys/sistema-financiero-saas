# Fitness Module Foundation

## Alcance inicial

El vertical fitness vive dentro del SaaS existente. No crea una aplicacion separada ni modifica el flujo de autenticacion. La activacion inicial se hace con `companies.business_model = 'fitness'` y el modulo `company_modules.module_key = 'fitness'`.

## Modelo de datos

La migracion `011_fitness_module_foundation.sql` separa la rutina planificada del entrenamiento ejecutado:

- Planificacion: `workout_programs`, `workout_weeks`, `workout_days`, `workout_day_exercises`.
- Ejecucion: `workout_logs`.
- Operacion fitness: `fitness_clients` y `exercises`.

Todas las tablas nuevas incluyen `company_id`, timestamps, `deleted_at` cuando aplica e indices basicos por empresa, estado, fecha o jerarquia.

## API

Las rutas protegidas viven bajo `/api/fitness`:

- `GET /fitness/dashboard`
- `GET|POST /fitness/clients`
- `GET|POST /fitness/exercises`
- `GET|POST /fitness/programs`
- `GET|POST /fitness/logs`

Los servicios resuelven `company_id` desde el usuario autenticado. Para `super_admin`, el `company_id` debe venir desde el modo soporte, manteniendo aislamiento multiempresa.

## Frontend

El vertical se expone en `/fitness` dentro de `AppShell`. Las empresas con `business_model = 'fitness'` aterrizan automaticamente en esa ruta y tienen menu propio de rendimiento, usuarios y configuracion.

La primera pantalla incluye dashboards, clientes, catalogo de ejercicios, rutinas base y registro diario. Esta version prioriza una fundacion funcional y extensible sobre flujos avanzados como plantillas, calendario, progresiones automaticas o asignacion por usuario deportista.

## Validacion funcional local

Script usado:

```bash
cd backend
node src/scripts/fitness-validation.js
```

El script aplica las migraciones fitness, valida tablas, foreign keys, indices, `company_id`, timestamps, crea datos demo y ejecuta CRUD de clientes, ejercicios, rutinas y logs.

Datos demo creados en la base configurada por `backend/.env`:

- Empresa: `RubDev Fitness`
- Slug: `rubdev-fitness`
- Modelo: `fitness`
- Entrenador: `trainer@rubdev.fit`
- Cliente: `athlete@rubdev.fit`
- Password demo: `FitnessDemo123!`

Resultado validado:

- Login entrenador y cliente funciona con la autenticacion existente.
- Dashboard entrenador devuelve clientes activos, rutinas activas, entrenamientos y cumplimiento.
- Dashboard cliente queda limitado a su propio perfil fitness.
- Empresas no fitness no ven clientes fitness.
- El rol `client` puede registrar sus propios entrenamientos y no puede consultar logs de otro deportista.
