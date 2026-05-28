import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const DEMO_COMPANY_SLUG = "rubdev-demo-company";
const DEMO_USER_EMAIL = "demo@rubdev.test";
const DEMO_USER_PASSWORD = "RubDevDemo123!";

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

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();
  return {
    status: response.status,
    body
  };
}

async function main() {
  ensureStagingEnvironment();

  const [{ app }, { pool }] = await Promise.all([
    import("../src/app.js"),
    import("../src/config/db.js")
  ]);

  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : null;

    if (!port) {
      throw new Error("No fue posible iniciar el servidor temporal");
    }

    const baseUrl = `http://127.0.0.1:${port}/api`;

    const loginResponse = await requestJson(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD
      })
    });

    if (!loginResponse.body?.data?.token) {
      throw new Error("No fue posible autenticar el usuario demo de staging");
    }

    const token = loginResponse.body.data.token;
    const companyId = loginResponse.body.data.user?.company_id;

    if (!companyId) {
      throw new Error("No fue posible resolver el company_id del usuario demo");
    }

    const authHeaders = {
      authorization: `Bearer ${token}`
    };

    const trainersList = await requestJson(
      `${baseUrl}/fitness/trainers?companyId=${companyId}&search=Demo`,
      { headers: authHeaders }
    );
    const trainerId = trainersList.body?.data?.[0]?.id ?? null;
    const trainerById = trainerId
      ? await requestJson(`${baseUrl}/fitness/trainers/${trainerId}?companyId=${companyId}`, {
          headers: authHeaders
        })
      : { body: { data: null } };

    const clientsList = await requestJson(
      `${baseUrl}/fitness/clients?companyId=${companyId}&status=active`,
      { headers: authHeaders }
    );
    const clientId = clientsList.body?.data?.[0]?.id ?? null;
    const clientById = clientId
      ? await requestJson(`${baseUrl}/fitness/clients/${clientId}?companyId=${companyId}`, {
          headers: authHeaders
        })
      : { body: { data: null } };

    const exercisesList = await requestJson(
      `${baseUrl}/fitness/exercises?companyId=${companyId}&search=Squat&isActive=true`,
      { headers: authHeaders }
    );
    const exerciseId = exercisesList.body?.data?.[0]?.id ?? null;
    const exerciseById = exerciseId
      ? await requestJson(`${baseUrl}/fitness/exercises/${exerciseId}?companyId=${companyId}`, {
          headers: authHeaders
        })
      : { body: { data: null } };

    const templatesList = await requestJson(
      `${baseUrl}/fitness/routine-templates?companyId=${companyId}&isActive=true`,
      { headers: authHeaders }
    );
    const templateId = templatesList.body?.data?.[0]?.id ?? null;
    const templateById = templateId
      ? await requestJson(
          `${baseUrl}/fitness/routine-templates/${templateId}?companyId=${companyId}`,
          { headers: authHeaders }
        )
      : { body: { data: null } };
    const templateStructure = templateId
      ? await requestJson(
          `${baseUrl}/fitness/routine-templates/${templateId}/structure?companyId=${companyId}`,
          { headers: authHeaders }
        )
      : { body: { data: null } };

    const missingCompanySafe = await requestJson(`${baseUrl}/fitness/trainers`, {
      headers: authHeaders
    });

    const mismatchCompanySafe = await requestJson(`${baseUrl}/fitness/trainers?companyId=00000000-0000-0000-0000-000000000000`, {
      headers: authHeaders
    });

    const structureWeekCount = templateStructure.body?.data?.weeks?.length ?? 0;
    const structureDayCount = (templateStructure.body?.data?.weeks ?? []).reduce(
      (total, week) => total + week.days.length,
      0
    );
    const structureExerciseCount = (templateStructure.body?.data?.weeks ?? []).reduce(
      (total, week) =>
        total + week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0),
      0
    );

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        validationScope: "fitness_core_api_routes",
        demoCompany: {
          slug: DEMO_COMPANY_SLUG
        },
        endpointsValidated: {
          trainers: {
            listCount: trainersList.body?.data?.length ?? 0,
            getById: Boolean(trainerById.body?.data?.id)
          },
          clients: {
            listCount: clientsList.body?.data?.length ?? 0,
            getById: Boolean(clientById.body?.data?.id)
          },
          exercises: {
            listCount: exercisesList.body?.data?.length ?? 0,
            getById: Boolean(exerciseById.body?.data?.id)
          },
          routineTemplates: {
            listCount: templatesList.body?.data?.length ?? 0,
            getById: Boolean(templateById.body?.data?.id),
            structure: Boolean(templateStructure.body?.data?.id),
            structureWeekCount,
            structureDayCount,
            structureExerciseCount
          }
        },
        safetyValidated: {
          missingCompanyReturnsEmptyList:
            Array.isArray(missingCompanySafe.body?.data) && missingCompanySafe.body.data.length === 0,
          mismatchCompanyReturnsEmptyList:
            Array.isArray(mismatchCompanySafe.body?.data) && mismatchCompanySafe.body.data.length === 0
        }
      })
    );
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    const { pool } = await import("../src/config/db.js");
    await pool.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_API_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
