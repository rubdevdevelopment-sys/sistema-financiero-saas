import { z } from "zod";

const categoryBody = z.object({
  company_id: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]),
  name: z.string().trim().min(2).max(120),
  color: z.string().trim().max(20).optional().nullable(),
  active: z.boolean().optional().default(true)
});

export const createCategorySchema = z.object({
  body: categoryBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateCategorySchema = z.object({
  body: categoryBody,
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});

export const listCategorySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    company_id: z.string().uuid().optional(),
    type: z.enum(["income", "expense"]).optional(),
    active: z.enum(["true", "false"]).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(12)
  })
});

export const categoryParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});
