import { z } from "zod";

const emptyStringToNull = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const nullableString = z.preprocess(
  emptyStringToNull,
  z.string().optional().nullable()
);

const nullableEmail = z.preprocess(
  emptyStringToNull,
  z.string().email().optional().nullable()
);

const querySchema = z.object({
  company_id: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  cycle_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  status: z.string().trim().optional(),
  contribution_type: z.enum(["ordinary", "extraordinary", "penalty"]).optional(),
  year: z.coerce.number().int().min(2000).optional(),
  month: z.coerce.number().int().min(1).max(12).optional()
});

const idParams = z.object({
  id: z.string().uuid()
});

export const fundQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: querySchema.optional()
});

export const fundParamsSchema = z.object({
  body: z.object({}).optional(),
  params: idParams,
  query: z.object({}).optional()
});

const cycleBody = z.object({
  company_id: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2000),
  name: z.string().trim().min(3).max(140),
  quota_value: z.coerce.number().positive(),
  monthly_contribution: z.coerce.number().positive(),
  start_date: z.string().trim().min(10),
  end_date: z.string().trim().min(10),
  status: z.enum(["draft", "active", "closed"]).default("draft"),
  is_active: z.boolean().optional().default(false),
  notes: nullableString
});

export const createFundCycleSchema = z.object({
  body: cycleBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateFundCycleSchema = z.object({
  body: cycleBody,
  params: idParams,
  query: z.object({}).optional()
});

const memberBody = z.object({
  company_id: z.string().uuid().optional(),
  full_name: z.string().trim().min(3).max(180),
  document_number: z.string().trim().min(4).max(40),
  phone: nullableString,
  email: nullableEmail,
  address: nullableString,
  status: z.enum(["active", "inactive"]).default("active"),
  notes: nullableString
});

export const createFundMemberSchema = z.object({
  body: memberBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateFundMemberSchema = z.object({
  body: memberBody,
  params: idParams,
  query: z.object({}).optional()
});

export const updateFundMemberStatusSchema = z.object({
  body: z.object({
    company_id: z.string().uuid().optional(),
    status: z.enum(["active", "inactive"])
  }),
  params: idParams,
  query: z.object({}).optional()
});

const quotaBody = z.object({
  company_id: z.string().uuid().optional(),
  member_id: z.string().uuid(),
  cycle_id: z.string().uuid(),
  quota_count: z.coerce.number().int().positive(),
  status: z.enum(["active", "inactive", "closed"]).default("active")
});

export const createFundQuotaSchema = z.object({
  body: quotaBody,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateFundQuotaSchema = z.object({
  body: quotaBody,
  params: idParams,
  query: z.object({}).optional()
});

export const generateContributionsSchema = z.object({
  body: z.object({
    company_id: z.string().uuid().optional(),
    cycle_id: z.string().uuid()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const generateExtraordinaryContributionSchema = z.object({
  body: z.object({
    company_id: z.string().uuid().optional(),
    cycle_id: z.string().uuid(),
    title: z.string().trim().min(3).max(160),
    due_date: z.string().trim().min(10),
    value_per_quota: z.coerce.number().positive()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const registerContributionPaymentSchema = z.object({
  body: z.object({
    paid_amount: z.coerce.number().min(0),
    payment_date: z.string().trim().min(10).optional().nullable(),
    payment_method: nullableString,
    notes: nullableString
  }),
  params: idParams,
  query: z.object({}).optional()
});

export const createFundPenaltySchema = z.object({
  body: z.object({
    company_id: z.string().uuid().optional(),
    member_id: z.string().uuid(),
    contribution_id: z.string().uuid().optional().nullable(),
    amount: z.coerce.number().positive(),
    reason: z.string().trim().min(3),
    status: z.enum(["pending", "paid", "waived"]).default("pending")
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
