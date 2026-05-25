import { z } from "zod";

const optionalPublicSlugSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().min(2).regex(/^[a-z0-9-]+$/).optional().nullable()
);

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    nit: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    currency: z.string().min(3).max(10).default("COP"),
    timezone: z.string().default("America/Bogota"),
    valor_objetivo_emaus: z.coerce.number().min(0).default(460000),
    active: z.boolean().optional().default(true),
    public_dashboard_enabled: z.boolean().optional().default(false),
    public_slug: optionalPublicSlugSchema
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
    name: z.string().min(2),
    nit: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    currency: z.string().min(3).max(10),
    timezone: z.string(),
    valor_objetivo_emaus: z.coerce.number().min(0),
    active: z.boolean(),
    public_dashboard_enabled: z.boolean().optional().default(false),
    public_slug: optionalPublicSlugSchema
  }).superRefine((value, ctx) => {
    if (value.public_dashboard_enabled && !value.public_slug) {
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
    name: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    valor_objetivo_emaus: z.coerce.number().min(0),
    public_dashboard_enabled: z.boolean().optional(),
    public_slug: optionalPublicSlugSchema
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

export const publicCompanyDashboardSchema = z.object({
  params: z.object({
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/)
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
