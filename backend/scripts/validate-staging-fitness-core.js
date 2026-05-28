import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const FITNESS_TABLES = {
  trainers: {
    requiredColumns: [
      "id",
      "company_id",
      "name",
      "email",
      "phone",
      "specialization",
      "status",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_trainers_company_id",
      "idx_trainers_company_status",
      "idx_trainers_company_email_active_unique"
    ]
  },
  fitness_clients: {
    requiredColumns: [
      "id",
      "company_id",
      "name",
      "email",
      "phone",
      "goal",
      "status",
      "assigned_trainer_id",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_fitness_clients_company_id",
      "idx_fitness_clients_company_status",
      "idx_fitness_clients_company_trainer",
      "idx_fitness_clients_company_email_active_unique"
    ]
  },
  exercises: {
    requiredColumns: [
      "id",
      "company_id",
      "name",
      "description",
      "category",
      "muscle_group",
      "equipment",
      "difficulty",
      "video_url",
      "image_url",
      "is_active",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_exercises_company_id",
      "idx_exercises_company_active",
      "idx_exercises_company_category",
      "idx_exercises_company_muscle_group",
      "idx_exercises_company_name_active_unique"
    ]
  },
  routine_templates: {
    requiredColumns: [
      "id",
      "company_id",
      "name",
      "description",
      "level",
      "goal",
      "duration_weeks",
      "is_active",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_routine_templates_company_id",
      "idx_routine_templates_company_active",
      "idx_routine_templates_company_name_active_unique"
    ]
  },
  routine_template_weeks: {
    requiredColumns: [
      "id",
      "company_id",
      "routine_template_id",
      "week_number",
      "name",
      "description",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_routine_template_weeks_company_id",
      "idx_routine_template_weeks_template",
      "idx_routine_template_weeks_template_week_active"
    ]
  },
  routine_template_days: {
    requiredColumns: [
      "id",
      "company_id",
      "routine_template_week_id",
      "day_number",
      "name",
      "description",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_routine_template_days_company_id",
      "idx_routine_template_days_week",
      "idx_routine_template_days_week_day_active"
    ]
  },
  routine_template_exercises: {
    requiredColumns: [
      "id",
      "company_id",
      "routine_template_day_id",
      "exercise_id",
      "sort_order",
      "sets",
      "reps",
      "rest_seconds",
      "notes",
      "created_by",
      "updated_by",
      "created_at",
      "updated_at",
      "deleted_at"
    ],
    expectedIndexes: [
      "idx_routine_template_exercises_company_id",
      "idx_routine_template_exercises_day",
      "idx_routine_template_exercises_exercise",
      "idx_routine_template_exercises_day_order_active"
    ]
  }
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

function ensureStagingEnvironment(envPath) {
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

function mapRowsByKey(rows, key) {
  return rows.reduce((accumulator, row) => {
    accumulator[row[key]] = row;
    return accumulator;
  }, {});
}

async function main() {
  const envPath = path.join(BACKEND_ROOT, ".env.staging");
  ensureStagingEnvironment(envPath);

  const tableNames = Object.keys(FITNESS_TABLES);
  const expectedIndexNames = Object.values(FITNESS_TABLES).flatMap((table) => table.expectedIndexes);

  const client = new Client(buildClientConfig(process.env.DATABASE_URL));
  await client.connect();

  try {
    const probe = await client.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    const tablesResult = await client.query(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = any($1::text[])
        order by table_name
      `,
      [tableNames]
    );

    const columnsResult = await client.query(
      `
        select table_name, column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = any($1::text[])
        order by table_name, ordinal_position
      `,
      [tableNames]
    );

    const rlsResult = await client.query(
      `
        select c.relname as table_name, c.relrowsecurity as rls_enabled
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relname = any($1::text[])
        order by c.relname
      `,
      [tableNames]
    );

    const indexesResult = await client.query(
      `
        select indexname
        from pg_indexes
        where schemaname = 'public'
          and tablename = any($1::text[])
          and indexname = any($2::text[])
        order by indexname
      `,
      [tableNames, expectedIndexNames]
    );

    const existingTables = new Set(tablesResult.rows.map((row) => row.table_name));
    const tableValidation = {};

    for (const tableName of tableNames) {
      tableValidation[tableName] = {
        exists: existingTables.has(tableName)
      };
    }

    const columnsByTable = columnsResult.rows.reduce((accumulator, row) => {
      if (!accumulator[row.table_name]) {
        accumulator[row.table_name] = [];
      }

      accumulator[row.table_name].push(row.column_name);
      return accumulator;
    }, {});

    for (const [tableName, tableDefinition] of Object.entries(FITNESS_TABLES)) {
      const existingColumns = new Set(columnsByTable[tableName] || []);
      const missingColumns = tableDefinition.requiredColumns.filter((columnName) => !existingColumns.has(columnName));
      const hasCompanyId = existingColumns.has("company_id");
      const hasAuditColumns = ["created_at", "updated_at", "deleted_at"].every((columnName) =>
        existingColumns.has(columnName)
      );

      tableValidation[tableName] = {
        ...tableValidation[tableName],
        requiredColumnsPresent: missingColumns.length === 0,
        missingColumns,
        hasCompanyId,
        hasAuditColumns
      };
    }

    const rlsByTable = mapRowsByKey(rlsResult.rows, "table_name");

    for (const tableName of tableNames) {
      tableValidation[tableName] = {
        ...tableValidation[tableName],
        rlsDisabled: rlsByTable[tableName]?.rls_enabled === false
      };
    }

    const existingIndexNames = new Set(indexesResult.rows.map((row) => row.indexname));
    const indexValidation = {};

    for (const [tableName, tableDefinition] of Object.entries(FITNESS_TABLES)) {
      const missingIndexes = tableDefinition.expectedIndexes.filter((indexName) => !existingIndexNames.has(indexName));

      indexValidation[tableName] = {
        expected: tableDefinition.expectedIndexes,
        found: tableDefinition.expectedIndexes.filter((indexName) => existingIndexNames.has(indexName)),
        missing: missingIndexes,
        allPresent: missingIndexes.length === 0
      };
    }

    const failedTables = Object.entries(tableValidation)
      .filter(([, result]) => {
        return !(
          result.exists &&
          result.requiredColumnsPresent &&
          result.hasCompanyId &&
          result.hasAuditColumns &&
          result.rlsDisabled
        );
      })
      .map(([tableName]) => tableName);

    const failedIndexTables = Object.entries(indexValidation)
      .filter(([, result]) => !result.allPresent)
      .map(([tableName]) => tableName);

    if (failedTables.length > 0 || failedIndexTables.length > 0) {
      throw new Error(
        `Fitness staging validation failed for tables: ${[...failedTables, ...failedIndexTables].join(", ")}`
      );
    }

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        validationScope: "fitness_core_schema",
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        tablesValidated: tableNames,
        tableValidation,
        indexValidation
      })
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_CORE_VALIDATION_ERROR");
  console.error(error.message);
  process.exit(1);
});
