import { z } from "zod";

function emptyStringToNull(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function normalizeCompanySlug(value) {
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

const nullableString = z.preprocess(
  emptyStringToNull,
  z.string().optional().nullable()
);

const nullableEmail = z.preprocess(
  emptyStringToNull,
  z.string().email().optional().nullable()
);

const nullableUrl = z.preprocess(
  emptyStringToNull,
  z.string().url().optional().nullable()
);

const businessModelSchema = z.enum([
  "standard",
  "cooperative_fund",
  "investment_fund",
  "rotating_capital",
  "lending_group",
  "fitness"
]);

const optionalPublicSlugSchema = z.preprocess(
  (value) => {
    const normalized = emptyStringToNull(value);
    return normalized ? normalizeCompanySlug(normalized) : normalized;
  },
  z.string().min(2).regex(/^[a-z0-9-]+$/).optional().nullable()
);

const fitnessSettingsSchema = z.object({
  gym_name: nullableString,
  logo_url: nullableUrl,
  hero_title: nullableString,
  hero_subtitle: nullableString,
  accent_color: nullableString,
  secondary_color: nullableString,
  contact_phone: nullableString,
  contact_email: nullableEmail,
  whatsapp: nullableString,
  instagram: nullableString,
  facebook: nullableString,
  tiktok: nullableString,
  address: nullableString,
  hours_summary: nullableString,
  portal_cta_text: nullableString,
  portal_cta_url: nullableUrl,
  trainers: z.array(z.object({
    name: z.string().trim().min(2),
    role: z.string().trim().min(2),
    bio: nullableString,
    image_url: nullableUrl
  })).optional(),
  testimonials: z.array(z.object({
    name: z.string().trim().min(2),
    quote: z.string().trim().min(4),
    goal: nullableString
  })).optional(),
  plans: z.array(z.object({
    name: z.string().trim().min(2),
    price: z.string().trim().min(1),
    label: nullableString,
    description: nullableString
  })).optional()
}).partial();

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
    business_model: businessModelSchema.default("standard"),
    valor_objetivo_emaus: z.coerce.number().min(0).default(460000),
    active: z.boolean().optional().default(true),
    public_dashboard_enabled: z.boolean().optional().default(false),
    public_slug: optionalPublicSlugSchema,
    fitness_settings: fitnessSettingsSchema.optional()
  }).superRefine((value, ctx) => {
    if (value.public_dashboard_enabled && !value.public_slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El slug publico es obligatorio cuando el portal publico esta activo",
        path: ["public_slug"]
      });
    }
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    nit: nullableString,
    email: nullableEmail,
    phone: nullableString,
    currency: z.string().min(3).max(10).optional(),
    timezone: z.string().optional(),
    business_model: businessModelSchema.optional(),
    valor_objetivo_emaus: z.coerce.number().min(0).optional(),
    active: z.boolean().optional(),
    public_dashboard_enabled: z.boolean().optional(),
    public_slug: optionalPublicSlugSchema,
    fitness_settings: fitnessSettingsSchema.optional()
  }).superRefine((value, ctx) => {
    if (value.public_dashboard_enabled === true && !value.public_slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El slug publico es obligatorio cuando el portal publico esta activo",
        path: ["public_slug"]
      });
    }
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
    valor_objetivo_emaus: z.coerce.number().min(0).optional(),
    public_dashboard_enabled: z.boolean().optional(),
    public_slug: optionalPublicSlugSchema,
    fitness_settings: fitnessSettingsSchema.optional()
  }).superRefine((value, ctx) => {
    if (value.public_dashboard_enabled === true && !value.public_slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El slug publico es obligatorio cuando el portal publico esta activo",
        path: ["public_slug"]
      });
    }
  }),
  params: z.object({}).optional(),
  query: z.object({
    company_id: z.string().uuid().optional()
  }).optional()
});

export const publicCompanyDashboardSchema = z.object({
  params: z.object({
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/)
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
