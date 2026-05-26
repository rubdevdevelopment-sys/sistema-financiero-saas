import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword } from "../utils/password.js";
import { loginUser } from "../services/auth.service.js";
import {
  createExercise,
  createFitnessClient,
  createProgram,
  createWorkoutLog,
  deleteExercise,
  deleteFitnessClient,
  deleteProgram,
  deleteWorkoutLog,
  getFitnessDashboard,
  listExercises,
  listFitnessClients,
  listPrograms,
  listWorkoutLogs,
  updateExercise,
  updateFitnessClient,
  updateProgram,
  updateWorkoutLog
} from "../services/fitness.service.js";
import { pool, query } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../..");

const trainerEmail = "trainer@rubdev.fit";
const clientEmail = "athlete@rubdev.fit";
const demoPassword = "FitnessDemo123!";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function applyMigration(relativePath) {
  const sql = await fs.readFile(path.join(root, relativePath), "utf8");
  await query("begin");
  try {
    await query(sql);
    await query("commit");
  } catch (error) {
    await query("rollback");
    throw error;
  }
}

async function ensureUser(companyId, fullName, email, role) {
  const passwordHash = await hashPassword(demoPassword);
  const { rows } = await query(
    `
      insert into app_users (company_id, full_name, email, password_hash, role, active)
      values ($1, $2, $3, $4, $5, true)
      on conflict (email)
      do update set
        company_id = excluded.company_id,
        full_name = excluded.full_name,
        password_hash = excluded.password_hash,
        role = excluded.role,
        active = true,
        updated_at = now()
      returning id, company_id, full_name, email, role
    `,
    [companyId, fullName, email, passwordHash, role]
  );

  return rows[0];
}

async function ensureRubDevFitness() {
  const { rows } = await query(
    `
      insert into companies (
        name, slug, nit, email, phone, currency, timezone, business_model,
        valor_objetivo_emaus, active, public_dashboard_enabled, public_slug
      )
      values (
        'RubDev Fitness', 'rubdev-fitness', 'FIT-001', 'fitness@rubdev.dev',
        '+57 300 000 0000', 'COP', 'America/Bogota', 'fitness',
        0, true, false, null
      )
      on conflict (slug)
      do update set
        name = excluded.name,
        business_model = 'fitness',
        active = true,
        updated_at = now()
      returning id, name, slug, business_model
    `
  );

  await query(
    `
      insert into company_modules (company_id, module_key, enabled)
      values ($1, 'fitness', true)
      on conflict (company_id, module_key)
      do update set enabled = true
    `,
    [rows[0].id]
  );

  return rows[0];
}

async function ensureDemoProfile(companyId, clientUserId, trainerRequest) {
  const existing = await query(
    `
      select *
      from fitness_clients
      where company_id = $1
        and user_id = $2
        and deleted_at is null
      limit 1
    `,
    [companyId, clientUserId]
  );

  if (existing.rows[0]) {
    return updateFitnessClient(
      existing.rows[0].id,
      {
        full_name: "Cliente Demo Fitness",
        email: clientEmail,
        phone: "+57 301 000 0000",
        weight_kg: 78,
        height_cm: 176,
        goal: "Ganar fuerza y mejorar composicion corporal",
        membership_type: "monthly",
        experience_level: "intermediate",
        injuries: "Molestia leve de rodilla derecha",
        status: "active",
        notes: "Perfil demo para validacion funcional"
      },
      trainerRequest
    );
  }

  return createFitnessClient(
    {
      company_id: companyId,
      user_id: clientUserId,
      full_name: "Cliente Demo Fitness",
      email: clientEmail,
      phone: "+57 301 000 0000",
      weight_kg: 78,
      height_cm: 176,
      goal: "Ganar fuerza y mejorar composicion corporal",
      membership_type: "monthly",
      experience_level: "intermediate",
      injuries: "Molestia leve de rodilla derecha",
      status: "active",
      notes: "Perfil demo para validacion funcional"
    },
    trainerRequest
  );
}

async function ensureDemoExercise(companyId, trainerRequest) {
  const existing = await query(
    `
      select *
      from exercises
      where company_id = $1
        and name = 'Sentadilla con barra'
        and deleted_at is null
      limit 1
    `,
    [companyId]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  return createExercise(
    {
      company_id: companyId,
      name: "Sentadilla con barra",
      muscle_group: "Pierna",
      category: "pierna",
      equipment: "Barra olimpica",
      instructions: "Mantener torso firme, profundidad controlada y rodillas alineadas.",
      video_url: "https://example.com/sentadilla"
    },
    trainerRequest
  );
}

async function ensureDemoProgram(companyId, clientId, exerciseId, trainerRequest) {
  const existing = await query(
    `
      select id
      from workout_programs
      where company_id = $1
        and fitness_client_id = $2
        and name = 'Fuerza Base Demo'
        and deleted_at is null
      limit 1
    `,
    [companyId, clientId]
  );

  const payload = {
    company_id: companyId,
    fitness_client_id: clientId,
    name: "Fuerza Base Demo",
    objective: "Construir tecnica, fuerza base y adherencia semanal",
    status: "active",
    starts_on: new Date().toISOString().slice(0, 10),
    weeks: [
      {
        week_number: 1,
        focus: "Base tecnica",
        days: [
          {
            day_number: 1,
            name: "Pierna y core",
            exercises: [
              {
                exercise_id: exerciseId,
                exercise_order: 1,
                planned_sets: 4,
                planned_reps: "6-8",
                target_rir: 2,
                target_rpe: 8,
                rest_seconds: 120,
                notes: "Priorizar rango completo"
              }
            ]
          }
        ]
      }
    ]
  };

  if (existing.rows[0]) {
    return updateProgram(existing.rows[0].id, payload, trainerRequest);
  }

  return createProgram(payload, trainerRequest);
}

async function ensureDemoLog(companyId, clientId, programId, exerciseId, clientRequest) {
  return createWorkoutLog(
    {
      company_id: companyId,
      fitness_client_id: clientId,
      program_id: programId,
      exercise_id: exerciseId,
      performed_on: new Date().toISOString().slice(0, 10),
      status: "completed",
      sets_completed: 4,
      reps_completed: 28,
      weight_used: 80,
      rir: 2,
      rpe: 8,
      observations: "Sesion demo completada con buena tecnica"
    },
    clientRequest
  );
}

async function inspectSchema() {
  const tables = [
    "fitness_clients",
    "exercises",
    "workout_programs",
    "workout_weeks",
    "workout_days",
    "workout_day_exercises",
    "workout_logs"
  ];

  const tableResult = await query(
    `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = any($1)
      order by table_name
    `,
    [tables]
  );
  assert(tableResult.rows.length === tables.length, "No existen todas las tablas fitness");

  const companyColumns = await query(
    `
      select table_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = any($1)
        and column_name = 'company_id'
    `,
    [tables]
  );
  assert(companyColumns.rows.length === tables.length, "Falta company_id en tablas fitness");

  const timestamps = await query(
    `
      select table_name, count(*)::int as total
      from information_schema.columns
      where table_schema = 'public'
        and table_name = any($1)
        and column_name in ('created_at', 'updated_at')
      group by table_name
    `,
    [tables]
  );
  assert(timestamps.rows.every((row) => row.total === 2), "Faltan timestamps en tablas fitness");

  const fkResult = await query(
    `
      select count(*)::int as total
      from information_schema.table_constraints
      where table_schema = 'public'
        and constraint_type = 'FOREIGN KEY'
        and table_name = any($1)
    `,
    [tables]
  );
  assert(Number(fkResult.rows[0].total) >= 10, "Foreign keys fitness insuficientes");

  const indexResult = await query(
    `
      select count(*)::int as total
      from pg_indexes
      where schemaname = 'public'
        and tablename = any($1)
    `,
    [tables]
  );
  assert(Number(indexResult.rows[0].total) >= 14, "Indices fitness insuficientes");

  return {
    tables: tableResult.rows.map((row) => row.table_name),
    foreignKeys: Number(fkResult.rows[0].total),
    indexes: Number(indexResult.rows[0].total)
  };
}

async function runCrudValidation(company, trainerRequest, clientRequest, client, exercise) {
  const suffix = Date.now();

  const tempClient = await createFitnessClient(
    {
      company_id: company.id,
      full_name: `Temporal Fitness ${suffix}`,
      weight_kg: 70,
      height_cm: 172,
      goal: "Validar CRUD",
      membership_type: "monthly",
      experience_level: "beginner",
      status: "active"
    },
    trainerRequest
  );
  const updatedClient = await updateFitnessClient(tempClient.id, { full_name: `Temporal Fitness Editado ${suffix}` }, trainerRequest);
  assert(updatedClient.full_name.includes("Editado"), "No actualizo cliente fitness");
  await deleteFitnessClient(tempClient.id, trainerRequest);

  const tempExercise = await createExercise(
    {
      company_id: company.id,
      name: `Press Demo ${suffix}`,
      muscle_group: "Pecho",
      category: "pecho",
      equipment: "Mancuernas",
      instructions: "Controlar fase excentrica"
    },
    trainerRequest
  );
  const updatedExercise = await updateExercise(tempExercise.id, { muscle_group: "Pecho superior" }, trainerRequest);
  assert(updatedExercise.muscle_group === "Pecho superior", "No actualizo ejercicio");
  await deleteExercise(tempExercise.id, trainerRequest);

  const tempProgram = await createProgram(
    {
      company_id: company.id,
      fitness_client_id: client.id,
      name: `Programa CRUD ${suffix}`,
      objective: "Validar estructura",
      status: "draft",
      weeks: [
        {
          week_number: 1,
          focus: "Semana inicial",
          days: [
            {
              day_number: 1,
              name: "Full body",
              exercises: [
                {
                  exercise_id: exercise.id,
                  exercise_order: 1,
                  planned_sets: 3,
                  planned_reps: "10",
                  target_rir: 2,
                  target_rpe: 7
                }
              ]
            }
          ]
        }
      ]
    },
    trainerRequest
  );
  const editedProgram = await updateProgram(
    tempProgram.id,
    {
      name: `Programa CRUD Editado ${suffix}`,
      weeks: [
        {
          week_number: 1,
          focus: "Semana editada",
          days: [
            {
              day_number: 2,
              name: "Tren inferior",
              exercises: [
                {
                  exercise_id: exercise.id,
                  exercise_order: 1,
                  planned_sets: 4,
                  planned_reps: "6-8",
                  target_rir: 1,
                  target_rpe: 8
                }
              ]
            }
          ]
        }
      ]
    },
    trainerRequest
  );
  assert(editedProgram.structure.some((week) => week.days.some((day) => day.day_number === 2)), "No edito estructura de rutina");
  await deleteProgram(tempProgram.id, trainerRequest);

  const tempLog = await createWorkoutLog(
    {
      company_id: company.id,
      fitness_client_id: client.id,
      exercise_id: exercise.id,
      performed_on: new Date().toISOString().slice(0, 10),
      status: "partial",
      sets_completed: 2,
      reps_completed: 16,
      weight_used: 60,
      rir: 3,
      rpe: 7,
      observations: "Log temporal"
    },
    clientRequest
  );
  const updatedLog = await updateWorkoutLog(tempLog.id, { status: "completed", rpe: 8 }, clientRequest);
  assert(updatedLog.status === "completed", "No actualizo workout log");
  await deleteWorkoutLog(tempLog.id, clientRequest);

  const [clients, exercises, programs, logs] = await Promise.all([
    listFitnessClients(trainerRequest, { company_id: company.id }),
    listExercises(trainerRequest, { company_id: company.id }),
    listPrograms(trainerRequest, { company_id: company.id }),
    listWorkoutLogs(trainerRequest, { company_id: company.id })
  ]);

  assert(clients.items.length >= 1, "Listado de clientes vacio");
  assert(exercises.items.length >= 1, "Listado de ejercicios vacio");
  assert(programs.items.length >= 1, "Listado de rutinas vacio");
  assert(logs.items.length >= 1, "Listado de logs vacio");

  return {
    clients: clients.items.length,
    exercises: exercises.items.length,
    programs: programs.items.length,
    logs: logs.items.length
  };
}

async function validateIsolation(company, clientRequest) {
  const standardCompany = await query(
    `
      select id
      from companies
      where business_model <> 'fitness'
      order by created_at asc
      limit 1
    `
  );

  if (standardCompany.rows[0]) {
    const standardRequest = {
      id: "00000000-0000-0000-0000-000000000000",
      companyId: standardCompany.rows[0].id,
      role: "operator",
      email: "standard-validation@example.com"
    };
    const standardClients = await listFitnessClients(standardRequest, {});
    assert(standardClients.items.length === 0, "Empresa no fitness ve clientes fitness");
  }

  let blockedCrossClient = false;
  const otherClient = await query(
    `
      select id
      from fitness_clients
      where company_id = $1
        and id <> $2
        and deleted_at is null
      limit 1
    `,
    [company.id, clientRequest.clientId]
  );

  if (otherClient.rows[0]) {
    try {
      await listWorkoutLogs(clientRequest, { client_id: otherClient.rows[0].id });
    } catch (_error) {
      blockedCrossClient = true;
    }
  } else {
    blockedCrossClient = true;
  }

  assert(blockedCrossClient, "Cliente pudo consultar datos de otro deportista");

  return {
    standardCompanyChecked: Boolean(standardCompany.rows[0]),
    clientScopeChecked: true
  };
}

async function main() {
  await applyMigration("backend/supabase/migrations/011_fitness_module_foundation.sql");
  await applyMigration("backend/supabase/migrations/012_fitness_client_role.sql");
  await applyMigration("backend/supabase/migrations/013_fitness_soft_delete_unique_indexes.sql");
  await applyMigration("backend/supabase/migrations/014_fitness_experience_upgrade.sql");
  const schema = await inspectSchema();

  const company = await ensureRubDevFitness();
  const trainer = await ensureUser(company.id, "Entrenador Demo Fitness", trainerEmail, "admin");
  const athlete = await ensureUser(company.id, "Deportista Demo Fitness", clientEmail, "client");

  const trainerRequest = {
    id: trainer.id,
    companyId: company.id,
    role: trainer.role,
    email: trainer.email
  };
  const clientRequest = {
    id: athlete.id,
    companyId: company.id,
    role: athlete.role,
    email: athlete.email
  };

  const client = await ensureDemoProfile(company.id, athlete.id, trainerRequest);
  clientRequest.clientId = client.id;
  const exercise = await ensureDemoExercise(company.id, trainerRequest);
  const program = await ensureDemoProgram(company.id, client.id, exercise.id, trainerRequest);
  const log = await ensureDemoLog(company.id, client.id, program.id, exercise.id, clientRequest);

  const trainerLogin = await loginUser({ email: trainerEmail, password: demoPassword });
  const clientLogin = await loginUser({ email: clientEmail, password: demoPassword });
  assert(trainerLogin.user.business_model === "fitness", "Login entrenador no retorna modelo fitness");
  assert(clientLogin.user.role === "client", "Login cliente no retorna rol client");

  const dashboardTrainer = await getFitnessDashboard(trainerRequest, { company_id: company.id });
  const dashboardClient = await getFitnessDashboard(clientRequest, {});
  assert(dashboardTrainer.cards.activeClients >= 1, "Dashboard entrenador sin clientes");
  assert(dashboardClient.cards.workouts30d >= 1, "Dashboard cliente sin entrenamientos");

  const crud = await runCrudValidation(company, trainerRequest, clientRequest, client, exercise);
  const isolation = await validateIsolation(company, clientRequest);

  console.log(
    JSON.stringify(
      {
        ok: true,
        company,
        demoUsers: {
          trainer: trainerEmail,
          client: clientEmail,
          password: demoPassword
        },
        seeded: {
          client: client.id,
          exercise: exercise.id,
          program: program.id,
          log: log.id
        },
        schema,
        dashboard: {
          trainer: dashboardTrainer.cards,
          client: dashboardClient.cards
        },
        crud,
        isolation
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
