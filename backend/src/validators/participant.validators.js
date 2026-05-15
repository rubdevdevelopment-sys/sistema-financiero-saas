import { z } from "zod";

const paymentStatuses = ["pending", "partial", "completed"];

const participantBody = z.object({
  company_id: z.string().uuid().optional(),
  document_number: z.string().trim().min(5).max(40),
  full_name: z.string().trim().min(3).max(180),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  target_amount: z.coerce.number().min(0).optional(),
  observations: z.string().trim().optional().nullable(),
  active: z.boolean().optional().default(true)
});

export const createParticipantSchema = z.object({
  body: participantBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateParticipantSchema = z.object({
  body: participantBody,
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});

export const listParticipantSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    company_id: z.string().uuid().optional(),
    search: z.string().trim().optional(),
    payment_status: z.enum(paymentStatuses).optional(),
    active: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
page_size: z.coerce.number().int().min(1).max(100).default(10)
  })
});

export const participantParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});
