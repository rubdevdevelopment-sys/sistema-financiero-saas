import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
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

  process.env.ENV_FILE = ".env.staging";
  applyEnv(loadEnvFile(envPath));
  process.env.JWT_SECRET ??= "fitness-local-staging-jwt-secret";

  if (process.env.NODE_ENV !== "staging" || process.env.APP_ENV !== "staging") {
    throw new Error("Staging environment not confirmed");
  }
}

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
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

    const token = loginResponse.body?.data?.token ?? null;
    const companyId = loginResponse.body?.data?.user?.company_id ?? null;

    if (!token || !companyId) {
      throw new Error("No fue posible autenticar el usuario demo de staging");
    }

    const authHeaders = {
      authorization: `Bearer ${token}`
    };

    const exercisesResponse = await requestJson(
      `${baseUrl}/fitness/exercises?companyId=${companyId}&isActive=true`,
      { headers: authHeaders }
    );
    const templatesResponse = await requestJson(
      `${baseUrl}/fitness/routine-templates?companyId=${companyId}&isActive=true`,
      { headers: authHeaders }
    );

    const exercises = Array.isArray(exercisesResponse.body?.data) ? exercisesResponse.body.data : [];
    const templates = Array.isArray(templatesResponse.body?.data) ? templatesResponse.body.data : [];

    console.log(
      JSON.stringify({
        envFile: ".env.staging",
        loginValidated: Boolean(token),
        companyIdIsUuid: isUuid(companyId),
        queryParamsValidated: {
          exercises: `companyId=${companyId}&isActive=true`,
          routineTemplates: `companyId=${companyId}&isActive=true`
        },
        apiResponses: {
          exercisesStatus: exercisesResponse.status,
          templatesStatus: templatesResponse.status
        },
        counts: {
          exercises: exercises.length,
          routineTemplates: templates.length
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

    await pool.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_DATA_LOADING_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
