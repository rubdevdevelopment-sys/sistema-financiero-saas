import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import { hashPassword } from "../src/utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const DEMO_COMPANY_SLUG = "rubdev-demo-company";
const DEMO_USER = {
  full_name: "Fitness Demo Trainer",
  email: "trainer@rubdev.fit",
  password: "DemoFitness123!",
  role: "admin",
  active: true
};

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

  process.env.ENV_FILE = ".env.staging";
  const env = loadEnvFile(envPath);
  applyEnv(env);
  process.env.JWT_SECRET ??= "fitness-local-staging-jwt-secret";

  if (process.env.NODE_ENV !== "staging" || process.env.APP_ENV !== "staging") {
    throw new Error("Staging environment not confirmed");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in backend/.env.staging");
  }

  return env;
}

async function getDemoCompany(client) {
  const { rows } = await client.query(
    `
      select id, slug, name, active
      from companies
      where lower(slug) = lower($1)
      limit 1
    `,
    [DEMO_COMPANY_SLUG]
  );

  if (!rows[0]) {
    throw new Error("RubDev Demo Company not found in staging");
  }

  return rows[0];
}

async function upsertDemoUser(client, companyId) {
  const passwordHash = await hashPassword(DEMO_USER.password);

  const { rows } = await client.query(
    `
      insert into app_users (company_id, full_name, email, password_hash, role, active)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (email)
      do update set
        company_id = excluded.company_id,
        full_name = excluded.full_name,
        password_hash = excluded.password_hash,
        role = excluded.role,
        active = excluded.active,
        updated_at = now()
      returning id, company_id, full_name, email, role, active
    `,
    [
      companyId,
      DEMO_USER.full_name,
      DEMO_USER.email,
      passwordHash,
      DEMO_USER.role,
      DEMO_USER.active
    ]
  );

  return rows[0];
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();

  return {
    status: response.status,
    body
  };
}

async function validateLogin() {
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

    const response = await requestJson(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: DEMO_USER.email,
        password: DEMO_USER.password
      })
    });

    return {
      status: response.status,
      success: response.status === 200 && Boolean(response.body?.data?.token),
      user: response.body?.data?.user
        ? {
            email: response.body.data.user.email,
            role: response.body.data.user.role,
            company_id: response.body.data.user.company_id,
            company_slug: response.body.data.user.company_slug
          }
        : null
    };
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

async function main() {
  const env = ensureStagingEnvironment();
  const client = new Client(buildClientConfig(env.DATABASE_URL));

  await client.connect();

  try {
    await client.query("begin");
    const company = await getDemoCompany(client);
    const user = await upsertDemoUser(client, company.id);
    await client.query("commit");

    const loginValidation = await validateLogin();

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        userConfirmed: {
          email: user.email,
          role: user.role,
          company_id: user.company_id
        },
        company: {
          slug: company.slug,
          name: company.name
        },
        loginValidated: loginValidation.success,
        loginEndpoint: "/api/auth/login",
        loginStatus: loginValidation.status
      })
    );
  } catch (error) {
    await client.query("rollback");
    console.error("STAGING_DEMO_LOGIN_ERROR");
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
