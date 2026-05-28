import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

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

  const directClient = new Client(buildClientConfig(process.env.DATABASE_URL));
  await directClient.connect();

  try {
    const probe = await directClient.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    const companyQuery = await directClient.query(
      `
        select id, name, slug
        from companies
        where lower(slug) = lower($1)
        limit 1
      `,
      ["rubdev-demo-company"]
    );

    const demoCompany = companyQuery.rows[0];

    if (!demoCompany) {
      throw new Error("RubDev Demo Company not found in staging");
    }

    const { getCompanySettings, getCompanySettingsWithFallback } = await import(
      "../src/settings/settings.service.js"
    );
    const { getCompanyBranding, getCompanyBrandingWithFallback } = await import(
      "../src/branding/branding.service.js"
    );
    const {
      getCompanyFeatures,
      getCompanyFeaturesByEnvironment,
      isFeatureEnabled
    } = await import("../src/features/features.service.js");
    const {
      getFeatureGuardState,
      isFeatureAllowed
    } = await import("../src/foundation/features/feature-guard.service.js");
    const {
      getFoundationRuntimeSnapshot,
      buildDefaultFoundationRuntime
    } = await import("../src/foundation/runtime/foundation-runtime.service.js");

    const settings = await getCompanySettings(demoCompany.id);
    const settingsWithFallback = await getCompanySettingsWithFallback(demoCompany.id);
    const settingsMissing = await getCompanySettingsWithFallback("00000000-0000-0000-0000-000000000000");

    const branding = await getCompanyBranding(demoCompany.id);
    const brandingWithFallback = await getCompanyBrandingWithFallback(demoCompany.id);
    const brandingMissing = await getCompanyBrandingWithFallback("00000000-0000-0000-0000-000000000000");

    const features = await getCompanyFeatures(demoCompany.id);
    const stagingFeatures = await getCompanyFeaturesByEnvironment(demoCompany.id, "staging");
    const unknownFeatures = await getCompanyFeatures("00000000-0000-0000-0000-000000000000");

    const featureEnabledChecks = {
      finance: await isFeatureEnabled(demoCompany.id, "finance"),
      fitness: await isFeatureEnabled(demoCompany.id, "fitness"),
      reports: await isFeatureEnabled(demoCompany.id, "reports"),
      ai: await isFeatureEnabled(demoCompany.id, "ai"),
      unknownCompanyFinance: await isFeatureEnabled("00000000-0000-0000-0000-000000000000", "finance")
    };

    const featureGuardStates = {
      finance: await getFeatureGuardState(demoCompany.id, "finance", { environment: "staging" }),
      fitness: await getFeatureGuardState(demoCompany.id, "fitness", { environment: "staging" }),
      reports: await getFeatureGuardState(demoCompany.id, "reports", { environment: "staging" }),
      ai: await getFeatureGuardState(demoCompany.id, "ai", { environment: "staging" }),
      unknownCompany: await getFeatureGuardState(
        "00000000-0000-0000-0000-000000000000",
        "finance",
        { environment: "staging" }
      )
    };

    const featureAllowedChecks = {
      finance: await isFeatureAllowed(demoCompany.id, "finance", { environment: "staging" }),
      fitness: await isFeatureAllowed(demoCompany.id, "fitness", { environment: "staging" }),
      reports: await isFeatureAllowed(demoCompany.id, "reports", { environment: "staging" }),
      ai: await isFeatureAllowed(demoCompany.id, "ai", { environment: "staging" })
    };

    const runtimeSnapshot = await getFoundationRuntimeSnapshot({
      companyId: demoCompany.id,
      environment: "staging",
      source: "staging_validation"
    });
    const unknownRuntimeSnapshot = await getFoundationRuntimeSnapshot({
      companyId: "00000000-0000-0000-0000-000000000000",
      environment: "staging",
      source: "staging_validation_unknown"
    });
    const defaultRuntime = buildDefaultFoundationRuntime({
      source: "staging_validation_default"
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
        settingsValidated: {
          direct: Boolean(settings?.company_id === demoCompany.id),
          fallback: settingsWithFallback?.currency === "COP" && settingsWithFallback?.timezone === "America/Bogota",
          missingCompanySafe: settingsMissing === null
        },
        brandingValidated: {
          direct: Boolean(branding?.company_id === demoCompany.id),
          fallback: brandingWithFallback?.theme_name === "rubdev-demo",
          missingCompanySafe: brandingMissing?.theme_name === "rubdev-default"
        },
        featuresValidated: {
          total: features.length,
          stagingOnly: stagingFeatures.length,
          missingCompanySafe: Array.isArray(unknownFeatures) && unknownFeatures.length === 0
        },
        featureEnabledChecks,
        featureGuardValidated: {
          finance: featureGuardStates.finance.enabled === true,
          fitness: featureGuardStates.fitness.enabled === true,
          reports: featureGuardStates.reports.enabled === false,
          ai: featureGuardStates.ai.enabled === false,
          unknownCompanySafe: featureGuardStates.unknownCompany.enabled === false
        },
        featureAllowedChecks,
        runtimeSnapshotValidated: {
          ready: runtimeSnapshot?.ready === true,
          companyMatches: runtimeSnapshot?.company?.id === demoCompany.id,
          tenantMatches: runtimeSnapshot?.tenant?.company_id === demoCompany.id,
          hasSettings: runtimeSnapshot?.settings?.currency === "COP",
          hasBranding: runtimeSnapshot?.branding?.theme_name === "rubdev-demo",
          hasFeatures: Array.isArray(runtimeSnapshot?.features) && runtimeSnapshot.features.length >= 4
        },
        fallbackBehaviorValidated: {
          unknownRuntimeReadyFalse: unknownRuntimeSnapshot?.ready === false,
          unknownRuntimeNoCompany: unknownRuntimeSnapshot?.company === null,
          defaultRuntimeReadyFalse: defaultRuntime?.ready === false,
          defaultRuntimeFeatureFallback:
            Array.isArray(defaultRuntime?.features) && defaultRuntime.features.length === 0
        }
      })
    );
  } finally {
    await directClient.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FOUNDATION_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
