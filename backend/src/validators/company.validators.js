import { z } from "zod";

function normalizeCompanySlug(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionalTrimmedString(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

const nullableString = z.preprocess(
  optionalTrimmedString,
  z.string().optional().nullable()
);

const nullableEmail = z.preprocess(
  optionalTrimmedString,
  z.string().email().optional().nullable()
);

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    slug: z.preprocess(
      normalizeCompanySlug,
      z.string().min(2).max(150).regex(/^[a-z0-9-]+$/)
    ),
    nit: nullableString,
    email: nullableEmail,
    phone: nullableString,
    currency: z.string().min(3).max(10).default("COP"),
    timezone: z.string().default("America/Bogota"),
    valor_objetivo_emaus: z.coerce.number().min(0).default(460000),
    active: z.boolean().optional().default(true)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    nit: nullableString,
    email: nullableEmail,
    phone: nullableString,
    currency: z.string().min(3).max(10),
    timezone: z.string(),
    valor_objetivo_emaus: z.coerce.number().min(0),
    active: z.boolean()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});

export const updateCurrentCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    phone: nullableString,
    email: nullableEmail,
    valor_objetivo_emaus: z.coerce.number().min(0)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
