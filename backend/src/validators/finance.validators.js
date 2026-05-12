import { z } from "zod";

const financeBody = z.object({
  company_id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().positive(),
  movement_date: z.string(),
  payment_method: z.string().min(2),
  status: z.enum(["pending", "completed", "cancelled"]).default("completed"),
  attachment_url: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  responsible: z.string().optional().nullable()
});

export const createFinanceSchema = z.object({
  body: financeBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateFinanceSchema = z.object({
  body: financeBody,
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});
