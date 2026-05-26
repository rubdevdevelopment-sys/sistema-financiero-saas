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
const nullableUuid = z.preprocess(emptyToNull, z.string().uuid().optional().nullable());
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
const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
const blockTypeSchema = z.enum(["straight", "superset", "circuit", "finisher", "mobility"]);
const logStatusSchema = z.enum(["completed", "partial", "skipped"]);

const scopedQuery = z.object({
  company_id: optionalUuid,
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  client_id: optionalUuid,
  membership_type: membershipTypeSchema.optional(),
  category: z.string().trim().optional(),
  difficulty: difficultySchema.optional(),
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
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say", "other"]).optional().nullable(),
  body_fat_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  muscle_mass_kg: z.coerce.number().min(0).optional().nullable(),
  bmi: z.coerce.number().min(0).max(100).optional().nullable(),
  medical_notes: nullableText,
  fitness_objectives: nullableText
});

const clientBody = clientBodyBase.superRefine((value, ctx) => {
  if (value.membership_type === "custom" && !value.custom_membership_label) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Define la etiqueta de la membresia personalizada",
      path: ["custom_membership_label"]
    });
  }

  if (value.membership_starts_on && value.membership_ends_on && value.membership_starts_on > value.membership_ends_on) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha final del plan debe ser posterior a la inicial",
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
  query: z.object({}).optional()
});

const exerciseBody = z.object({
  company_id: optionalUuid,
  name: z.string().trim().min(2).max(160),
  muscle_group: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(80),
  difficulty: difficultySchema.default("intermediate"),
  instructions: nullableText,
  equipment: nullableText,
  video_url: nullableUrl,
  thumbnail_url: nullableUrl,
  active: z.boolean().default(true)
});

export const fitnessExerciseCreateSchema = z.object({
  body: exerciseBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessExerciseUpdateSchema = z.object({
  body: exerciseBody.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).optional()
});

const programExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  exercise_order: z.coerce.number().int().min(1).default(1),
  block_name: nullableText,
  block_type: blockTypeSchema.default("straight"),
  superset_group: nullableText,
  planned_sets: z.coerce.number().int().min(1).default(3),
  planned_reps: z.string().trim().min(1).max(40).default("8-12"),
  planned_weight: z.coerce.number().min(0).optional().nullable(),
  target_rir: z.coerce.number().min(0).optional().nullable(),
  target_rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  rest_seconds: z.coerce.number().int().min(0).optional().nullable(),
  notes: nullableText
});

const programBodyBase = z.object({
  company_id: optionalUuid,
  fitness_client_id: nullableUuid,
  name: z.string().trim().min(2).max(180),
  objective: nullableText,
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
  starts_on: nullableDate,
  ends_on: nullableDate,
  weeks: z.array(z.object({
    week_number: z.coerce.number().int().min(1),
    focus: nullableText,
    notes: nullableText,
    days: z.array(z.object({
      day_number: z.coerce.number().int().min(1).max(7),
      name: z.string().trim().min(2).max(160),
      notes: nullableText,
      exercises: z.array(programExerciseSchema).default([])
    })).default([])
  })).default([])
});

const programBody = programBodyBase.superRefine((value, ctx) => {
  if (value.starts_on && value.ends_on && value.starts_on > value.ends_on) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha final de la rutina debe ser posterior a la inicial",
      path: ["ends_on"]
    });
  }
});

export const fitnessProgramCreateSchema = z.object({
  body: programBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessProgramUpdateSchema = z.object({
  body: programBodyBase.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).optional()
});

const logBody = z.object({
  company_id: optionalUuid,
  fitness_client_id: z.string().uuid(),
  program_id: nullableUuid,
  workout_day_id: nullableUuid,
  workout_day_exercise_id: nullableUuid,
  exercise_id: nullableUuid,
  performed_on: z.string().date().default(() => new Date().toISOString().slice(0, 10)),
  status: logStatusSchema.default("completed"),
  sets_completed: z.coerce.number().int().min(0).default(0),
  reps_completed: z.coerce.number().int().min(0).default(0),
  weight_used: z.coerce.number().min(0).optional().nullable(),
  rir: z.coerce.number().min(0).optional().nullable(),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  progress_photo_url: nullableUrl,
  observations: nullableText
});

export const fitnessLogCreateSchema = z.object({
  body: logBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const fitnessLogUpdateSchema = z.object({
  body: logBody.partial(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).optional()
});
