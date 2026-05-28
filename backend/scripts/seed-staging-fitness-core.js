import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const DEMO_COMPANY_SLUG = "rubdev-demo-company";
const DEMO_USER_EMAIL = "demo@rubdev.test";

const DEMO_TRAINERS = [
  {
    name: "Laura Fitness Demo",
    email: "laura.fitness.demo@rubdev.test",
    phone: "+57 310 000 1001",
    specialization: "Functional Training",
    status: "active"
  },
  {
    name: "Carlos Strength Demo",
    email: "carlos.strength.demo@rubdev.test",
    phone: "+57 310 000 1002",
    specialization: "Strength and Conditioning",
    status: "active"
  }
];

const DEMO_CLIENTS = [
  {
    name: "Ana Client Demo",
    email: "ana.client.demo@rubdev.test",
    phone: "+57 320 000 2001",
    goal: "Build consistency and improve full-body strength.",
    status: "active",
    assignedTrainerEmail: "laura.fitness.demo@rubdev.test"
  },
  {
    name: "Mateo Client Demo",
    email: "mateo.client.demo@rubdev.test",
    phone: "+57 320 000 2002",
    goal: "Reduce body fat and improve conditioning.",
    status: "active",
    assignedTrainerEmail: "carlos.strength.demo@rubdev.test"
  }
];

const DEMO_EXERCISES = [
  {
    name: "Squat",
    description: "Basic lower-body squat pattern for strength and control.",
    category: "strength",
    muscle_group: "legs",
    equipment: "bodyweight",
    difficulty: "beginner",
    video_url: "https://example.com/demo/fitness/squat",
    image_url: "https://example.com/demo/fitness/squat.jpg",
    is_active: true
  },
  {
    name: "Push Up",
    description: "Horizontal pushing movement focused on chest, shoulders, and triceps.",
    category: "strength",
    muscle_group: "chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    video_url: "https://example.com/demo/fitness/push-up",
    image_url: "https://example.com/demo/fitness/push-up.jpg",
    is_active: true
  },
  {
    name: "Plank",
    description: "Core stability hold that reinforces trunk control.",
    category: "core",
    muscle_group: "core",
    equipment: "bodyweight",
    difficulty: "beginner",
    video_url: "https://example.com/demo/fitness/plank",
    image_url: "https://example.com/demo/fitness/plank.jpg",
    is_active: true
  },
  {
    name: "Jumping Jacks",
    description: "Low-complexity cardio movement for warm-up and conditioning.",
    category: "cardio",
    muscle_group: "full_body",
    equipment: "bodyweight",
    difficulty: "beginner",
    video_url: "https://example.com/demo/fitness/jumping-jacks",
    image_url: "https://example.com/demo/fitness/jumping-jacks.jpg",
    is_active: true
  },
  {
    name: "Dumbbell Row",
    description: "Unilateral pulling movement to develop upper-back strength.",
    category: "strength",
    muscle_group: "back",
    equipment: "dumbbells",
    difficulty: "intermediate",
    video_url: "https://example.com/demo/fitness/dumbbell-row",
    image_url: "https://example.com/demo/fitness/dumbbell-row.jpg",
    is_active: true
  },
  {
    name: "Hip Thrust",
    description: "Glute-focused hinge movement for posterior chain strength.",
    category: "strength",
    muscle_group: "glutes",
    equipment: "bench",
    difficulty: "intermediate",
    video_url: "https://example.com/demo/fitness/hip-thrust",
    image_url: "https://example.com/demo/fitness/hip-thrust.jpg",
    is_active: true
  }
];

const DEMO_ROUTINE_TEMPLATES = [
  {
    name: "Beginner Full Body Demo",
    description: "Introductory full-body template focused on movement quality and consistency.",
    level: "beginner",
    goal: "strength",
    duration_weeks: 4,
    is_active: true,
    weeks: [
      {
        week_number: 1,
        name: "Foundation Week 1",
        description: "Learn the patterns and build routine.",
        days: [
          {
            day_number: 1,
            name: "Full Body A",
            description: "Intro strength and core.",
            exercises: [
              { exerciseName: "Squat", sort_order: 1, sets: 3, reps: "10", rest_seconds: 60, notes: "Controlled tempo." },
              { exerciseName: "Push Up", sort_order: 2, sets: 3, reps: "8-10", rest_seconds: 60, notes: "Elevate hands if needed." },
              { exerciseName: "Plank", sort_order: 3, sets: 3, reps: "30s", rest_seconds: 45, notes: "Keep ribs tucked." }
            ]
          },
          {
            day_number: 3,
            name: "Full Body B",
            description: "Pulling and glute emphasis.",
            exercises: [
              { exerciseName: "Dumbbell Row", sort_order: 1, sets: 3, reps: "10/side", rest_seconds: 60, notes: "Pause at the top." },
              { exerciseName: "Hip Thrust", sort_order: 2, sets: 3, reps: "12", rest_seconds: 75, notes: "Squeeze glutes at lockout." },
              { exerciseName: "Jumping Jacks", sort_order: 3, sets: 3, reps: "30s", rest_seconds: 30, notes: "Use as conditioning finisher." }
            ]
          }
        ]
      },
      {
        week_number: 2,
        name: "Foundation Week 2",
        description: "Repeat structure with small progression.",
        days: [
          {
            day_number: 1,
            name: "Full Body A+",
            description: "Slight volume increase.",
            exercises: [
              { exerciseName: "Squat", sort_order: 1, sets: 4, reps: "10", rest_seconds: 60, notes: "Add a pause at the bottom." },
              { exerciseName: "Push Up", sort_order: 2, sets: 3, reps: "10-12", rest_seconds: 60, notes: "Keep stable trunk." },
              { exerciseName: "Plank", sort_order: 3, sets: 3, reps: "35s", rest_seconds: 45, notes: "Steady breathing." }
            ]
          },
          {
            day_number: 3,
            name: "Full Body B+",
            description: "Progress pulling and glute work.",
            exercises: [
              { exerciseName: "Dumbbell Row", sort_order: 1, sets: 4, reps: "10/side", rest_seconds: 60, notes: "Keep shoulders square." },
              { exerciseName: "Hip Thrust", sort_order: 2, sets: 4, reps: "10", rest_seconds: 75, notes: "Use stronger lockout." },
              { exerciseName: "Jumping Jacks", sort_order: 3, sets: 4, reps: "30s", rest_seconds: 30, notes: "Smooth rhythm." }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Weight Loss Starter Demo",
    description: "Entry-level template combining cardio intervals and simple resistance work.",
    level: "beginner",
    goal: "weight_loss",
    duration_weeks: 4,
    is_active: true,
    weeks: [
      {
        week_number: 1,
        name: "Starter Week 1",
        description: "Build movement tolerance and habit.",
        days: [
          {
            day_number: 2,
            name: "Conditioning Circuit",
            description: "Short cardio-focused session.",
            exercises: [
              { exerciseName: "Jumping Jacks", sort_order: 1, sets: 4, reps: "40s", rest_seconds: 20, notes: "Stay light on the feet." },
              { exerciseName: "Push Up", sort_order: 2, sets: 3, reps: "8", rest_seconds: 45, notes: "Use incline when needed." },
              { exerciseName: "Plank", sort_order: 3, sets: 3, reps: "25s", rest_seconds: 30, notes: "Stay braced." }
            ]
          },
          {
            day_number: 4,
            name: "Lower Body Burn",
            description: "Simple lower-body and posterior chain work.",
            exercises: [
              { exerciseName: "Squat", sort_order: 1, sets: 3, reps: "12", rest_seconds: 45, notes: "Drive through the whole foot." },
              { exerciseName: "Hip Thrust", sort_order: 2, sets: 3, reps: "12", rest_seconds: 60, notes: "Keep chin tucked." },
              { exerciseName: "Jumping Jacks", sort_order: 3, sets: 3, reps: "45s", rest_seconds: 20, notes: "Steady pace." }
            ]
          }
        ]
      },
      {
        week_number: 2,
        name: "Starter Week 2",
        description: "Add a little density and confidence.",
        days: [
          {
            day_number: 2,
            name: "Conditioning Circuit Plus",
            description: "Progressed conditioning volume.",
            exercises: [
              { exerciseName: "Jumping Jacks", sort_order: 1, sets: 5, reps: "40s", rest_seconds: 20, notes: "Keep breathing controlled." },
              { exerciseName: "Dumbbell Row", sort_order: 2, sets: 3, reps: "12/side", rest_seconds: 45, notes: "Use a moderate load." },
              { exerciseName: "Plank", sort_order: 3, sets: 3, reps: "30s", rest_seconds: 30, notes: "Maintain neutral spine." }
            ]
          },
          {
            day_number: 4,
            name: "Lower Body Burn Plus",
            description: "Progress lower-body stamina.",
            exercises: [
              { exerciseName: "Squat", sort_order: 1, sets: 4, reps: "12", rest_seconds: 45, notes: "Stay tall through the torso." },
              { exerciseName: "Hip Thrust", sort_order: 2, sets: 4, reps: "12", rest_seconds: 60, notes: "Pause at the top." },
              { exerciseName: "Push Up", sort_order: 3, sets: 3, reps: "10", rest_seconds: 45, notes: "Keep elbows at about 45 degrees." }
            ]
          }
        ]
      }
    ]
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

async function getDemoCompany(client) {
  const { rows } = await client.query(
    `
      select id, slug
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

async function getSeedUser(client, companyId) {
  const { rows } = await client.query(
    `
      select id, email
      from app_users
      where company_id = $1 and lower(email) = lower($2)
      limit 1
    `,
    [companyId, DEMO_USER_EMAIL]
  );

  return rows[0] ?? null;
}

async function upsertTrainer(client, companyId, userId, trainer) {
  const existing = await client.query(
    `
      select id
      from trainers
      where company_id = $1
        and lower(email) = lower($2)
      limit 1
    `,
    [companyId, trainer.email]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update trainers
        set
          name = $3,
          phone = $4,
          specialization = $5,
          status = $6,
          updated_by = $7,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name, email
      `,
      [
        existing.rows[0].id,
        companyId,
        trainer.name,
        trainer.phone,
        trainer.specialization,
        trainer.status,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into trainers (
        company_id, name, email, phone, specialization, status,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $7)
      returning id, name, email
    `,
    [
      companyId,
      trainer.name,
      trainer.email,
      trainer.phone,
      trainer.specialization,
      trainer.status,
      userId
    ]
  );

  return rows[0];
}

async function upsertFitnessClient(client, companyId, userId, trainerId, fitnessClient) {
  const existing = await client.query(
    `
      select id
      from fitness_clients
      where company_id = $1
        and lower(email) = lower($2)
      limit 1
    `,
    [companyId, fitnessClient.email]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update fitness_clients
        set
          name = $3,
          phone = $4,
          goal = $5,
          status = $6,
          assigned_trainer_id = $7,
          updated_by = $8,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name, email
      `,
      [
        existing.rows[0].id,
        companyId,
        fitnessClient.name,
        fitnessClient.phone,
        fitnessClient.goal,
        fitnessClient.status,
        trainerId,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into fitness_clients (
        company_id, name, email, phone, goal, status,
        assigned_trainer_id, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      returning id, name, email
    `,
    [
      companyId,
      fitnessClient.name,
      fitnessClient.email,
      fitnessClient.phone,
      fitnessClient.goal,
      fitnessClient.status,
      trainerId,
      userId
    ]
  );

  return rows[0];
}

async function upsertExercise(client, companyId, userId, exercise) {
  const existing = await client.query(
    `
      select id
      from exercises
      where company_id = $1
        and lower(name) = lower($2)
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, exercise.name]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update exercises
        set
          description = $3,
          category = $4,
          muscle_group = $5,
          equipment = $6,
          difficulty = $7,
          video_url = $8,
          image_url = $9,
          is_active = $10,
          updated_by = $11,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name
      `,
      [
        existing.rows[0].id,
        companyId,
        exercise.description,
        exercise.category,
        exercise.muscle_group,
        exercise.equipment,
        exercise.difficulty,
        exercise.video_url,
        exercise.image_url,
        exercise.is_active,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into exercises (
        company_id, name, description, category, muscle_group, equipment,
        difficulty, video_url, image_url, is_active, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      returning id, name
    `,
    [
      companyId,
      exercise.name,
      exercise.description,
      exercise.category,
      exercise.muscle_group,
      exercise.equipment,
      exercise.difficulty,
      exercise.video_url,
      exercise.image_url,
      exercise.is_active,
      userId
    ]
  );

  return rows[0];
}

async function upsertRoutineTemplate(client, companyId, userId, template) {
  const existing = await client.query(
    `
      select id
      from routine_templates
      where company_id = $1
        and lower(name) = lower($2)
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, template.name]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_templates
        set
          description = $3,
          level = $4,
          goal = $5,
          duration_weeks = $6,
          is_active = $7,
          updated_by = $8,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name
      `,
      [
        existing.rows[0].id,
        companyId,
        template.description,
        template.level,
        template.goal,
        template.duration_weeks,
        template.is_active,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_templates (
        company_id, name, description, level, goal, duration_weeks,
        is_active, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      returning id, name
    `,
    [
      companyId,
      template.name,
      template.description,
      template.level,
      template.goal,
      template.duration_weeks,
      template.is_active,
      userId
    ]
  );

  return rows[0];
}

async function upsertRoutineTemplateWeek(client, companyId, userId, templateId, week) {
  const existing = await client.query(
    `
      select id
      from routine_template_weeks
      where company_id = $1
        and routine_template_id = $2
        and week_number = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, templateId, week.week_number]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_weeks
        set
          name = $4,
          description = $5,
          updated_by = $6,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_id = $3
        returning id, week_number
      `,
      [
        existing.rows[0].id,
        companyId,
        templateId,
        week.name,
        week.description,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_weeks (
        company_id, routine_template_id, week_number, name, description,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $6)
      returning id, week_number
    `,
    [companyId, templateId, week.week_number, week.name, week.description, userId]
  );

  return rows[0];
}

async function upsertRoutineTemplateDay(client, companyId, userId, weekId, day) {
  const existing = await client.query(
    `
      select id
      from routine_template_days
      where company_id = $1
        and routine_template_week_id = $2
        and day_number = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, weekId, day.day_number]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_days
        set
          name = $4,
          description = $5,
          updated_by = $6,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_week_id = $3
        returning id, day_number
      `,
      [
        existing.rows[0].id,
        companyId,
        weekId,
        day.name,
        day.description,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_days (
        company_id, routine_template_week_id, day_number, name, description,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $6)
      returning id, day_number
    `,
    [companyId, weekId, day.day_number, day.name, day.description, userId]
  );

  return rows[0];
}

async function upsertRoutineTemplateExercise(client, companyId, userId, dayId, exerciseId, item) {
  const existing = await client.query(
    `
      select id
      from routine_template_exercises
      where company_id = $1
        and routine_template_day_id = $2
        and sort_order = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, dayId, item.sort_order]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_exercises
        set
          exercise_id = $4,
          sets = $5,
          reps = $6,
          rest_seconds = $7,
          notes = $8,
          updated_by = $9,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_day_id = $3
        returning id, sort_order
      `,
      [
        existing.rows[0].id,
        companyId,
        dayId,
        exerciseId,
        item.sets,
        item.reps,
        item.rest_seconds,
        item.notes,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_exercises (
        company_id, routine_template_day_id, exercise_id, sort_order, sets,
        reps, rest_seconds, notes, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      returning id, sort_order
    `,
    [
      companyId,
      dayId,
      exerciseId,
      item.sort_order,
      item.sets,
      item.reps,
      item.rest_seconds,
      item.notes,
      userId
    ]
  );

  return rows[0];
}

async function fetchCounts(client, companyId) {
  const countQueries = {
    trainers: `select count(*)::int as total from trainers where company_id = $1 and deleted_at is null`,
    fitness_clients: `select count(*)::int as total from fitness_clients where company_id = $1 and deleted_at is null`,
    exercises: `select count(*)::int as total from exercises where company_id = $1 and deleted_at is null`,
    routine_templates: `select count(*)::int as total from routine_templates where company_id = $1 and deleted_at is null`,
    routine_template_weeks: `select count(*)::int as total from routine_template_weeks where company_id = $1 and deleted_at is null`,
    routine_template_days: `select count(*)::int as total from routine_template_days where company_id = $1 and deleted_at is null`,
    routine_template_exercises: `select count(*)::int as total from routine_template_exercises where company_id = $1 and deleted_at is null`
  };

  const counts = {};

  for (const [key, sql] of Object.entries(countQueries)) {
    const { rows } = await client.query(sql, [companyId]);
    counts[key] = rows[0]?.total ?? 0;
  }

  return counts;
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

    const company = await getDemoCompany(client);
    const seedUser = await getSeedUser(client, company.id);
    const seedUserId = seedUser?.id ?? null;

    const trainersByEmail = {};
    for (const trainer of DEMO_TRAINERS) {
      const savedTrainer = await upsertTrainer(client, company.id, seedUserId, trainer);
      trainersByEmail[savedTrainer.email.toLowerCase()] = savedTrainer;
    }

    const clients = [];
    for (const fitnessClient of DEMO_CLIENTS) {
      const assignedTrainer = trainersByEmail[fitnessClient.assignedTrainerEmail.toLowerCase()];
      const savedClient = await upsertFitnessClient(
        client,
        company.id,
        seedUserId,
        assignedTrainer?.id ?? null,
        fitnessClient
      );
      clients.push(savedClient);
    }

    const exercisesByName = {};
    for (const exercise of DEMO_EXERCISES) {
      const savedExercise = await upsertExercise(client, company.id, seedUserId, exercise);
      exercisesByName[savedExercise.name] = savedExercise;
    }

    const templates = [];
    for (const template of DEMO_ROUTINE_TEMPLATES) {
      const savedTemplate = await upsertRoutineTemplate(client, company.id, seedUserId, template);
      templates.push(savedTemplate);

      for (const week of template.weeks) {
        const savedWeek = await upsertRoutineTemplateWeek(client, company.id, seedUserId, savedTemplate.id, week);

        for (const day of week.days) {
          const savedDay = await upsertRoutineTemplateDay(client, company.id, seedUserId, savedWeek.id, day);

          for (const item of day.exercises) {
            const exercise = exercisesByName[item.exerciseName];

            if (!exercise) {
              throw new Error(`Missing seeded exercise reference: ${item.exerciseName}`);
            }

            await upsertRoutineTemplateExercise(
              client,
              company.id,
              seedUserId,
              savedDay.id,
              exercise.id,
              item
            );
          }
        }
      }
    }

    await client.query("commit");

    const counts = await fetchCounts(client, company.id);

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        seedScope: "fitness_core_demo_data",
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        demoCompany: {
          slug: company.slug
        },
        demoRecords: {
          trainers: DEMO_TRAINERS.map((trainer) => trainer.name),
          fitness_clients: DEMO_CLIENTS.map((fitnessClient) => fitnessClient.name),
          exercises: DEMO_EXERCISES.map((exercise) => exercise.name),
          routine_templates: DEMO_ROUTINE_TEMPLATES.map((template) => template.name)
        },
        counts
      })
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_SEED_ERROR");
  console.error(error.message);
  process.exit(1);
});
