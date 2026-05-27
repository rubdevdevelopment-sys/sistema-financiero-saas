import { z } from "zod";

const emptyToNull = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const nullableText = z.preprocess(
  emptyToNull,
  z.string().trim().optional().nullable()
);

const nullableUrl = z.preprocess(
  emptyToNull,
  z.string().url().optional().nullable()
);

const nullableDate = z.preprocess(
  emptyToNull,
  z.string().date().optional().nullable()
);

const optionalUuid = z.string().uuid().optional();

const nullableUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().optional().nullable()
);

const optionalBoolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const membershipTypeSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "semiannual",
  "annual",
  "custom"
]);

const clientStatusSchema = z.enum(["active", "paused", "inactive"]);

const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced"
]);

const blockTypeSchema = z.enum([
  "straight",
  "superset",
  "circuit",
  "finisher",
  "mobility"
]);

const logStatusSchema = z.enum([
  "completed",
  "partial",
  "skipped"
]);

const scopedQuery = z.object({
  company_id: optionalUuid,

  search: nullableText,

  status: nullableText,

  client_id: optionalUuid,

  membership_type: z.preprocess(
    emptyToNull,
    membershipTypeSchema.optional().nullable()
  ),

  category: nullableText,

  difficulty: z.preprocess(
    emptyToNull,
    difficultySchema.optional().nullable()
  ),

  active: optionalBoolean,

  date_from: nullableDate,

  date_to: nullableDate,

  page: z.coerce.number().int().min(1).default(1),

  page_size: z.coerce.number().int().min(1).max(100).default(20)
});

export const fitnessListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: scopedQuery
});

export const fitnessDashboardSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    company_id: optionalUuid,
    client_id: optionalUuid,
    date_from: nullableDate,
    date_to: nullableDate
  }).optional()
});

export const fitnessParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ company_id: optionalUuid }).optional()
});

const clientBodyBase = z.object({
  company_id: optionalUuid,
  user_id: nullableUuid,
  full_name: z.string().trim().min(2).max(180),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: nullableText,
  avatar_url: nullableUrl,
  weight_kg: z.coerce.number().positive().optional().nullable(),
  height_cm: z.coerce.number().positive().optional().nullable(),
  goal: nullableText,
  experience_level: difficultySchema.default("beginner"),
  injuries: nullableText,
  status: clientStatusSchema.default("active"),
  notes: nullableText,
  membership_type: membershipTypeSchema.default("monthly"),
  custom_membership_label: nullableText,
  membership_starts_on: nullableDate,
  membership_ends_on: nullableDate,
  birth_date: nullableDate,
  gender: z.enum([
    "female",
    "male",
    "non_binary",
    "prefer_not_to_say",
    "other"
  ]).optional().nullable(),
  body_fat_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  muscle_mass_kg: z.coerce.number().min(0).optional().nullable(),
  bmi: z.coerce.number().min(0).max(100).optional().nullable(),
  medical_notes: nullableText,
  fitness_objectives: nullableText
});

const clientBody = clientBodyBase.superRefine((value, ctx) => {
  if (
    value.membership_type === "custom" &&
    !value.custom_membership_label
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Define la etiqueta de la membresia personalizada",
      path: ["custom_membership_label"]
    });
  }

  if (
    value.membership_starts_on &&
    value.membership_ends_on &&
    value.membership_starts_on > value.membership_ends_on
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha inicial no puede ser mayor a la fecha final",
      path: ["membership_ends_on"]
    });
  }
});

export const fitnessClientCreateSchema = z.object({
  body: clientBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessClientUpdateSchema = z.object({
  body: clientBodyBase.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ company_id: optionalUuid }).optional()
});

const exerciseBody = z.object({
  company_id: optionalUuid,
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(120),
  muscle_group: nullableText,
  equipment: nullableText,
  instructions: nullableText,
  video_url: nullableUrl,
  thumbnail_url: nullableUrl,
  difficulty: difficultySchema.default("beginner"),
  estimated_duration_minutes: z.coerce.number().positive().optional().nullable(),
  calories_estimate: z.coerce.number().positive().optional().nullable(),
  is_public: optionalBoolean.default(false)
});

export const fitnessExerciseCreateSchema = z.object({
  body: exerciseBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessExerciseUpdateSchema = z.object({
  body: exerciseBody.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ company_id: optionalUuid }).optional()
});

const programBody = z.object({
  company_id: optionalUuid,
  client_id: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  objective: nullableText,
  description: nullableText,
  starts_on: nullableDate,
  ends_on: nullableDate,
  status: z.enum(["draft", "active", "completed", "archived"]).default("draft"),
  weeks: z.array(z.object({
    week_number: z.coerce.number().int().positive(),
    title: nullableText,
    days: z.array(z.object({
      day_number: z.coerce.number().int().positive(),
      title: nullableText,
      blocks: z.array(z.object({
        type: blockTypeSchema.default("straight"),
        title: nullableText,
        notes: nullableText,
        exercises: z.array(z.object({
          exercise_id: z.string().uuid(),
          sets: z.coerce.number().int().positive().default(3),
          reps: nullableText,
          rir: z.coerce.number().min(0).max(10).optional().nullable(),
          rest_seconds: z.coerce.number().int().min(0).optional().nullable(),
          tempo: nullableText,
          target_weight: z.coerce.number().min(0).optional().nullable(),
          notes: nullableText,
          order_index: z.coerce.number().int().min(0).default(0)
        })).default([])
      })).default([])
    })).default([])
  })).default([])
});

export const fitnessProgramCreateSchema = z.object({
  body: programBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessProgramUpdateSchema = z.object({
  body: programBody.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ company_id: optionalUuid }).optional()
});

const logBody = z.object({
  company_id: optionalUuid,
  client_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  performed_at: nullableDate,
  weight: z.coerce.number().min(0).optional().nullable(),
  reps: z.coerce.number().int().min(0).optional().nullable(),
  rir: z.coerce.number().min(0).max(10).optional().nullable(),
  rpe: z.coerce.number().min(0).max(10).optional().nullable(),
  tempo: nullableText,
  duration_minutes: z.coerce.number().positive().optional().nullable(),
  distance_km: z.coerce.number().min(0).optional().nullable(),
  calories_burned: z.coerce.number().min(0).optional().nullable(),
  notes: nullableText,
  status: logStatusSchema.default("completed")
});

export const fitnessLogCreateSchema = z.object({
  body: logBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessLogUpdateSchema = z.object({
  body: logBody.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ company_id: optionalUuid }).optional()
});
