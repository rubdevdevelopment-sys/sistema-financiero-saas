import { z } from "zod";

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
    active: z.boolean().optional().default(true)
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
    active: z.boolean()
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
    valor_objetivo_emaus: z.coerce.number().min(0)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
