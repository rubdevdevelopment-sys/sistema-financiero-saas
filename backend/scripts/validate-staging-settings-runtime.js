import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(BACKEND_ROOT, "..");
const UNKNOWN_COMPANY_ID = "00000000-0000-0000-0000-000000000000";

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
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
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

async function main() {
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

  const client = new Client(buildClientConfig(process.env.DATABASE_URL));
  await client.connect();

  try {
    const probe = await client.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    const companyResult = await client.query(
      `
        select id, name, slug, timezone, currency
        from companies
        where lower(slug) = lower($1)
        limit 1
      `,
      ["rubdev-demo-company"]
    );

    const demoCompany = companyResult.rows[0];

    if (!demoCompany) {
      throw new Error("RubDev Demo Company not found in staging");
    }

    const { resolveCompanyRuntimeSettings, buildDefaultRuntimeSettings } = await import(
      "../src/foundation/settings/settings-resolver.service.js"
    );
    const { buildRuntimeSettingsValue } = await import(
      pathToFileURL(
        path.join(REPO_ROOT, "frontend/src/foundation/hooks/runtime-settings.shared.js")
      ).href
    );

    const demoSettings = await resolveCompanyRuntimeSettings({
      companyId: demoCompany.id,
      source: "staging_validation_demo"
    });
    const unknownSettings = await resolveCompanyRuntimeSettings({
      companyId: UNKNOWN_COMPANY_ID,
      source: "staging_validation_unknown"
    });
    const nullSettings = await resolveCompanyRuntimeSettings({
      companyId: null,
      source: "staging_validation_null"
    });

    const hookFromResolved = buildRuntimeSettingsValue(demoSettings, {
      source: "sandbox_resolved_settings"
    });
    const hookFromMissingRuntime = buildRuntimeSettingsValue(
      {
        timezone: null,
        currency: null,
        locale: null,
        language: null,
        date_format: null,
        number_format: null,
        ready: false
      },
      { source: "sandbox_missing_runtime" }
    );
    const hookFromNull = buildRuntimeSettingsValue(null, {
      source: "sandbox_null_runtime"
    });

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        demoCompany: {
          id: demoCompany.id,
          slug: demoCompany.slug
        },
        settingsRuntimeValidated: {
          demo: {
            timezone: demoSettings.timezone,
            currency: demoSettings.currency,
            locale: demoSettings.locale,
            language: demoSettings.language,
            date_format: demoSettings.date_format,
            number_format: demoSettings.number_format,
            ready: demoSettings.ready,
            source: demoSettings.source
          },
          unknown: {
            timezone: unknownSettings.timezone,
            currency: unknownSettings.currency,
            locale: unknownSettings.locale,
            language: unknownSettings.language,
            date_format: unknownSettings.date_format,
            number_format: unknownSettings.number_format,
            ready: unknownSettings.ready,
            source: unknownSettings.source
          },
          nullCompany: {
            timezone: nullSettings.timezone,
            currency: nullSettings.currency,
            locale: nullSettings.locale,
            language: nullSettings.language,
            date_format: nullSettings.date_format,
            number_format: nullSettings.number_format,
            ready: nullSettings.ready,
            source: nullSettings.source
          }
        },
        fallbackBehaviorValidated: {
          demoMatchesSeed:
            demoSettings.timezone === "America/Bogota" &&
            demoSettings.currency === "COP" &&
            demoSettings.locale === "es-CO" &&
            demoSettings.language === "es",
          unknownUsesDefaults:
            unknownSettings.timezone === "America/Bogota" &&
            unknownSettings.currency === "COP" &&
            unknownSettings.locale === "es-CO" &&
            unknownSettings.language === "es" &&
            unknownSettings.ready === false,
          nullUsesDefaults:
            nullSettings.timezone === "America/Bogota" &&
            nullSettings.currency === "COP" &&
            nullSettings.locale === "es-CO" &&
            nullSettings.language === "es" &&
            nullSettings.ready === false,
          defaultBuilderSafe:
            buildDefaultRuntimeSettings().timezone === "America/Bogota" &&
            buildDefaultRuntimeSettings().currency === "COP"
        },
        hookValidated: {
          resolvedSettings:
            hookFromResolved.timezone === "America/Bogota" &&
            hookFromResolved.currency === "COP" &&
            hookFromResolved.locale === "es-CO" &&
            hookFromResolved.language === "es",
          missingRuntimeFallback:
            hookFromMissingRuntime.timezone === "America/Bogota" &&
            hookFromMissingRuntime.currency === "COP" &&
            hookFromMissingRuntime.locale === "es-CO" &&
            hookFromMissingRuntime.language === "es",
          nullRuntimeFallback:
            hookFromNull.timezone === "America/Bogota" &&
            hookFromNull.currency === "COP" &&
            hookFromNull.locale === "es-CO" &&
            hookFromNull.language === "es"
        }
      })
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("STAGING_SETTINGS_RUNTIME_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
