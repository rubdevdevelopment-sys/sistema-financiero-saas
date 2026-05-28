import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";
import { hashPassword } from "../src/utils/password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const DEMO_COMPANY = {
  name: "RubDev Demo Company",
  slug: "rubdev-demo-company",
  email: "demo-company@rubdev.test",
  phone: "+57 300 000 0000",
  currency: "COP",
  timezone: "America/Bogota",
  active: true,
  valor_objetivo_emaus: 460000,
  business_model: "standard",
  public_dashboard_enabled: false,
  public_slug: null
};

const DEMO_USER = {
  full_name: "RubDev Demo Admin",
  email: "demo@rubdev.test",
  password: "RubDevDemo123!",
  role: "admin",
  active: true
};

const DEMO_MODULES = ["finance", "fitness"];

const DEMO_SETTINGS = {
  timezone: "America/Bogota",
  locale: "es-CO",
  language: "es",
  currency: "COP",
  date_format: "DD/MM/YYYY",
  number_format: "1.234,56"
};

const DEMO_BRANDING = {
  logo_url: "https://example.com/demo/rubdev-logo.png",
  favicon_url: "https://example.com/demo/rubdev-favicon.png",
  primary_color: "#14b8a6",
  secondary_color: "#0f172a",
  accent_color: "#38bdf8",
  background_color: "#f8fafc",
  text_color: "#0f172a",
  dark_mode_enabled: false,
  theme_name: "rubdev-demo"
};

const DEMO_FEATURES = [
  {
    feature_key: "finance",
    enabled: true,
    environment: "staging",
    metadata: { tier: "core", seed: "demo" }
  },
  {
    feature_key: "fitness",
    enabled: true,
    environment: "staging",
    metadata: { tier: "beta", seed: "demo" }
  },
  {
    feature_key: "reports",
    enabled: false,
    environment: "staging",
    metadata: { tier: "premium", seed: "demo" }
  },
  {
    feature_key: "ai",
    enabled: false,
    environment: "staging",
    metadata: { tier: "experimental", seed: "demo" }
  }
];

function loadEnv(filePath) {
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

async function ensureStagingEnvironment() {
  const envPath = path.join(BACKEND_ROOT, ".env.staging");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing backend/.env.staging");
  }

  const env = loadEnv(envPath);

  if (env.NODE_ENV !== "staging" || env.APP_ENV !== "staging") {
    throw new Error("Staging environment not confirmed");
  }

  if (!env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in backend/.env.staging");
  }

  return env;
}

async function upsertCompany(client) {
  const { rows } = await client.query(
    `
      insert into companies (
        name, slug, nit, email, phone, currency, timezone, active,
        valor_objetivo_emaus, business_model, public_dashboard_enabled, public_slug
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      on conflict (slug)
      do update set
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        currency = excluded.currency,
        timezone = excluded.timezone,
        active = excluded.active,
        valor_objetivo_emaus = excluded.valor_objetivo_emaus,
        business_model = excluded.business_model,
        public_dashboard_enabled = excluded.public_dashboard_enabled,
        public_slug = excluded.public_slug,
        updated_at = now()
      returning id, slug
    `,
    [
      DEMO_COMPANY.name,
      DEMO_COMPANY.slug,
      null,
      DEMO_COMPANY.email,
      DEMO_COMPANY.phone,
      DEMO_COMPANY.currency,
      DEMO_COMPANY.timezone,
      DEMO_COMPANY.active,
      DEMO_COMPANY.valor_objetivo_emaus,
      DEMO_COMPANY.business_model,
      DEMO_COMPANY.public_dashboard_enabled,
      DEMO_COMPANY.public_slug
    ]
  );

  return rows[0];
}

async function upsertUser(client, companyId) {
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
      returning id, email
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

async function upsertModules(client, companyId) {
  const results = [];

  for (const moduleKey of DEMO_MODULES) {
    const { rows } = await client.query(
      `
        insert into company_modules (company_id, module_key, enabled)
        values ($1, $2, true)
        on conflict (company_id, module_key)
        do update set enabled = true
        returning module_key, enabled
      `,
      [companyId, moduleKey]
    );

    results.push(rows[0]);
  }

  return results;
}

async function upsertSettings(client, companyId) {
  const { rows } = await client.query(
    `
      insert into company_settings (
        company_id, timezone, locale, language, currency, date_format, number_format
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (company_id)
      do update set
        timezone = excluded.timezone,
        locale = excluded.locale,
        language = excluded.language,
        currency = excluded.currency,
        date_format = excluded.date_format,
        number_format = excluded.number_format,
        updated_at = now()
      returning company_id
    `,
    [
      companyId,
      DEMO_SETTINGS.timezone,
      DEMO_SETTINGS.locale,
      DEMO_SETTINGS.language,
      DEMO_SETTINGS.currency,
      DEMO_SETTINGS.date_format,
      DEMO_SETTINGS.number_format
    ]
  );

  return rows[0];
}

async function upsertBranding(client, companyId) {
  const { rows } = await client.query(
    `
      insert into company_branding (
        company_id, logo_url, favicon_url, primary_color, secondary_color,
        accent_color, background_color, text_color, dark_mode_enabled, theme_name
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      on conflict (company_id)
      do update set
        logo_url = excluded.logo_url,
        favicon_url = excluded.favicon_url,
        primary_color = excluded.primary_color,
        secondary_color = excluded.secondary_color,
        accent_color = excluded.accent_color,
        background_color = excluded.background_color,
        text_color = excluded.text_color,
        dark_mode_enabled = excluded.dark_mode_enabled,
        theme_name = excluded.theme_name,
        updated_at = now()
      returning company_id
    `,
    [
      companyId,
      DEMO_BRANDING.logo_url,
      DEMO_BRANDING.favicon_url,
      DEMO_BRANDING.primary_color,
      DEMO_BRANDING.secondary_color,
      DEMO_BRANDING.accent_color,
      DEMO_BRANDING.background_color,
      DEMO_BRANDING.text_color,
      DEMO_BRANDING.dark_mode_enabled,
      DEMO_BRANDING.theme_name
    ]
  );

  return rows[0];
}

async function upsertFeatures(client, companyId) {
  const results = [];

  for (const feature of DEMO_FEATURES) {
    const { rows } = await client.query(
      `
        insert into company_features (company_id, feature_key, enabled, environment, metadata)
        values ($1, $2, $3, $4, $5::jsonb)
        on conflict (company_id, feature_key, environment)
        do update set
          enabled = excluded.enabled,
          metadata = excluded.metadata,
          updated_at = now()
        returning feature_key, enabled, environment
      `,
      [
        companyId,
        feature.feature_key,
        feature.enabled,
        feature.environment,
        JSON.stringify(feature.metadata)
      ]
    );

    results.push(rows[0]);
  }

  return results;
}

async function validateSeed(client, companyId) {
  const company = await client.query(
    `select id, name, slug from companies where id = $1 limit 1`,
    [companyId]
  );
  const user = await client.query(
    `
      select id, email, role
      from app_users
      where company_id = $1 and lower(email) = lower($2)
      limit 1
    `,
    [companyId, DEMO_USER.email]
  );
  const modules = await client.query(
    `
      select module_key, enabled
      from company_modules
      where company_id = $1 and module_key = any($2::varchar[])
      order by module_key asc
    `,
    [companyId, DEMO_MODULES]
  );
  const settings = await client.query(
    `
      select timezone, locale, language, currency
      from company_settings
      where company_id = $1
      limit 1
    `,
    [companyId]
  );
  const branding = await client.query(
    `
      select primary_color, secondary_color, accent_color, theme_name
      from company_branding
      where company_id = $1
      limit 1
    `,
    [companyId]
  );
  const features = await client.query(
    `
      select feature_key, enabled, environment
      from company_features
      where company_id = $1
      order by feature_key asc
    `,
    [companyId]
  );

  return {
    company: company.rows[0] ?? null,
    user: user.rows[0] ?? null,
    modules: modules.rows,
    settings: settings.rows[0] ?? null,
    branding: branding.rows[0] ?? null,
    features: features.rows
  };
}

async function main() {
  const env = await ensureStagingEnvironment();
  const client = new Client(buildClientConfig(env.DATABASE_URL));

  await client.connect();

  try {
    const probe = await client.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    await client.query("begin");

    const company = await upsertCompany(client);
    const user = await upsertUser(client, company.id);
    const modules = await upsertModules(client, company.id);
    const settings = await upsertSettings(client, company.id);
    const branding = await upsertBranding(client, company.id);
    const features = await upsertFeatures(client, company.id);

    await client.query("commit");

    const validation = await validateSeed(client, company.id);

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        seedScriptExecuted: true,
        insertedOrUpdated: {
          company: Boolean(company?.id),
          user: Boolean(user?.id),
          modules: modules.length,
          settings: Boolean(settings?.company_id),
          branding: Boolean(branding?.company_id),
          features: features.length
        },
        validation
      })
    );
  } catch (error) {
    await client.query("rollback");
    console.error("STAGING_SEED_ERROR");
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
