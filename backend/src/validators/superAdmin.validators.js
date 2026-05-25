import { z } from "zod";

export const supportSessionSchema = z.object({
  body: z.object({
    company_id: z.string().uuid(),
    reason: z.string().trim().min(3).max(240)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
