import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    company_id: z.string().uuid(),
    type: z.enum(["income", "expense"]),
    name: z.string().min(2),
    color: z.string().optional().nullable(),
    active: z.boolean().optional().default(true)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
