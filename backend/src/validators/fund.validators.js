import { z } from "zod";

export const fundQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    company_id: z.string().uuid().optional()
  }).optional()
});
