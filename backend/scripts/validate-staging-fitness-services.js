import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const DEMO_COMPANY_SLUG = "rubdev-demo-company";

function loadEnvFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function applyEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }
}

function buildClientConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: (parsed.pathname || "/postgres").replace(/^\//, "") || "postgres",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: { rejectUnauthorized: false }
  };
}

function ensureStagingEnvironment() {
  const envPath = path.join(BACKEND_ROOT, ".env.staging");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing backend/.env.staging");
  }

  const env = loadEnvFile(envPath);
  applyEnv(env);

  if (process.env.NODE_ENV !== "staging" || process.env.APP_ENV !== "staging") {
    throw new Error("Staging environment not confirmed");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in backend/.env.staging");
  }
}

async function main() {
  ensureStagingEnvironment();

  const client = new Client(buildClientConfig(process.env.DATABASE_URL));
  await client.connect();

  try {
    const probe = await client.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    const companyResult = await client.query(
      `
        select id, slug
        from companies
        where lower(slug) = lower($1)
        limit 1
      `,
      [DEMO_COMPANY_SLUG]
    );

    const demoCompany = companyResult.rows[0];

    if (!demoCompany) {
      throw new Error("RubDev Demo Company not found in staging");
    }

    const trainersModule = await import("../src/fitness/trainers/trainers.service.js");
    const clientsModule = await import("../src/fitness/clients/fitness-clients.service.js");
    const exercisesModule = await import("../src/fitness/exercises/exercises.service.js");
    const routinesModule = await import("../src/fitness/routines/routine-templates.service.js");

    const trainers = await trainersModule.listTrainers(demoCompany.id, { search: "Demo" });
    const trainerById = await trainersModule.getTrainerById(demoCompany.id, trainers[0]?.id ?? null);
    const trainersFallback = await trainersModule.listTrainers(null, { search: "Demo" });
    const trainerFallbackById = await trainersModule.getTrainerById(null, trainers[0]?.id ?? null);

    const fitnessClients = await clientsModule.listFitnessClients(demoCompany.id, { status: "active" });
    const fitnessClientById = await clientsModule.getFitnessClientById(
      demoCompany.id,
      fitnessClients[0]?.id ?? null
    );
    const clientsFallback = await clientsModule.listFitnessClients(null, { status: "active" });
    const clientFallbackById = await clientsModule.getFitnessClientById(null, fitnessClients[0]?.id ?? null);

    const exercises = await exercisesModule.listExercises(demoCompany.id, {
      isActive: true,
      search: "Squat"
    });
    const exerciseById = await exercisesModule.getExerciseById(demoCompany.id, exercises[0]?.id ?? null);
    const exercisesFallback = await exercisesModule.listExercises(null, { isActive: true });
    const exerciseFallbackById = await exercisesModule.getExerciseById(null, exercises[0]?.id ?? null);

    const templates = await routinesModule.listRoutineTemplates(demoCompany.id, { isActive: true });
    const templateById = await routinesModule.getRoutineTemplateById(
      demoCompany.id,
      templates[0]?.id ?? null
    );
    const templateStructure = await routinesModule.getRoutineTemplateStructure(
      demoCompany.id,
      templates[0]?.id ?? null
    );
    const templatesFallback = await routinesModule.listRoutineTemplates(null, { isActive: true });
    const templateFallbackById = await routinesModule.getRoutineTemplateById(null, templates[0]?.id ?? null);
    const templateStructureFallback = await routinesModule.getRoutineTemplateStructure(
      null,
      templates[0]?.id ?? null
    );

    const structureWeekCount = templateStructure?.weeks?.length ?? 0;
    const structureDayCount = (templateStructure?.weeks ?? []).reduce(
      (total, week) => total + week.days.length,
      0
    );
    const structureExerciseCount = (templateStructure?.weeks ?? []).reduce(
      (total, week) =>
        total +
        week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0),
      0
    );

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        validationScope: "fitness_core_services",
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        demoCompany: {
          slug: demoCompany.slug
        },
        trainersValidated: {
          listCount: trainers.length,
          hasTrainer: Boolean(trainerById?.id),
          filteredListSafe: trainers.every((item) => item.company_id === demoCompany.id)
        },
        fitnessClientsValidated: {
          listCount: fitnessClients.length,
          hasClient: Boolean(fitnessClientById?.id),
          filteredListSafe: fitnessClients.every((item) => item.company_id === demoCompany.id)
        },
        exercisesValidated: {
          listCount: exercises.length,
          hasExercise: Boolean(exerciseById?.id),
          filteredListSafe: exercises.every((item) => item.company_id === demoCompany.id)
        },
        routineTemplatesValidated: {
          listCount: templates.length,
          hasTemplate: Boolean(templateById?.id),
          structureFound: Boolean(templateStructure?.id),
          structureWeekCount,
          structureDayCount,
          structureExerciseCount
        },
        fallbackValidated: {
          trainersListEmpty: Array.isArray(trainersFallback) && trainersFallback.length === 0,
          trainerByIdNull: trainerFallbackById === null,
          clientsListEmpty: Array.isArray(clientsFallback) && clientsFallback.length === 0,
          clientByIdNull: clientFallbackById === null,
          exercisesListEmpty: Array.isArray(exercisesFallback) && exercisesFallback.length === 0,
          exerciseByIdNull: exerciseFallbackById === null,
          templatesListEmpty: Array.isArray(templatesFallback) && templatesFallback.length === 0,
          templateByIdNull: templateFallbackById === null,
          templateStructureNull: templateStructureFallback === null
        }
      })
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_SERVICES_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
