import { z } from "zod";

const nullableText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().optional().nullable()
);

const optionalUuid = z.string().uuid().optional();

const scopedQuery = z.object({
  company_id: optionalUuid,
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  client_id: optionalUuid,
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
  query: z.object({ company_id: optionalUuid, client_id: optionalUuid }).optional()
});

export const fitnessParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).optional()
});

const clientBody = z.object({
  company_id: optionalUuid,
  user_id: z.string().uuid().optional().nullable(),
  full_name: z.string().trim().min(2).max(180),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: nullableText,
  weight_kg: z.coerce.number().positive().optional().nullable(),
  height_cm: z.coerce.number().positive().optional().nullable(),
  goal: nullableText,
  experience_level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  injuries: nullableText,
  status: z.enum(["active", "paused", "inactive"]).default("active"),
  notes: nullableText
});

export const fitnessClientCreateSchema = z.object({ body: clientBody, params: z.object({}).optional(), query: z.object({}).optional() });
export const fitnessClientUpdateSchema = z.object({ body: clientBody.partial(), params: z.object({ id: z.string().uuid() }), query: z.object({}).optional() });

const exerciseBody = z.object({
  company_id: optionalUuid,
  name: z.string().trim().min(2).max(160),
  muscle_group: z.string().trim().min(2).max(80),
  instructions: nullableText,
  equipment: nullableText,
  video_url: nullableText,
  active: z.boolean().default(true)
});

export const fitnessExerciseCreateSchema = z.object({ body: exerciseBody, params: z.object({}).optional(), query: z.object({}).optional() });
export const fitnessExerciseUpdateSchema = z.object({ body: exerciseBody.partial(), params: z.object({ id: z.string().uuid() }), query: z.object({}).optional() });

const programBody = z.object({
  company_id: optionalUuid,
  fitness_client_id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(180),
  objective: nullableText,
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
  starts_on: z.string().date().optional().nullable(),
  ends_on: z.string().date().optional().nullable(),
  weeks: z.array(z.object({
    week_number: z.coerce.number().int().min(1),
    focus: nullableText,
    notes: nullableText,
    days: z.array(z.object({
      day_number: z.coerce.number().int().min(1).max(7),
      name: z.string().trim().min(2).max(160),
      notes: nullableText,
      exercises: z.array(z.object({
        exercise_id: z.string().uuid(),
        exercise_order: z.coerce.number().int().min(1).default(1),
        planned_sets: z.coerce.number().int().min(1).default(3),
        planned_reps: z.string().trim().min(1).max(40).default("8-12"),
        planned_weight: z.coerce.number().min(0).optional().nullable(),
        target_rir: z.coerce.number().min(0).optional().nullable(),
        target_rpe: z.coerce.number().min(1).max(10).optional().nullable(),
        rest_seconds: z.coerce.number().int().min(0).optional().nullable(),
        notes: nullableText
      })).default([])
    })).default([])
  })).default([])
});

export const fitnessProgramCreateSchema = z.object({ body: programBody, params: z.object({}).optional(), query: z.object({}).optional() });
export const fitnessProgramUpdateSchema = z.object({ body: programBody.partial(), params: z.object({ id: z.string().uuid() }), query: z.object({}).optional() });

const logBody = z.object({
  company_id: optionalUuid,
  fitness_client_id: z.string().uuid(),
  program_id: z.string().uuid().optional().nullable(),
  workout_day_id: z.string().uuid().optional().nullable(),
  workout_day_exercise_id: z.string().uuid().optional().nullable(),
  exercise_id: z.string().uuid().optional().nullable(),
  performed_on: z.string().date().default(() => new Date().toISOString().slice(0, 10)),
  status: z.enum(["completed", "partial", "skipped"]).default("completed"),
  sets_completed: z.coerce.number().int().min(0).default(0),
  reps_completed: z.coerce.number().int().min(0).default(0),
  weight_used: z.coerce.number().min(0).optional().nullable(),
  rir: z.coerce.number().min(0).optional().nullable(),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  observations: nullableText
});

export const fitnessLogCreateSchema = z.object({ body: logBody, params: z.object({}).optional(), query: z.object({}).optional() });
export const fitnessLogUpdateSchema = z.object({ body: logBody.partial(), params: z.object({ id: z.string().uuid() }), query: z.object({}).optional() });
