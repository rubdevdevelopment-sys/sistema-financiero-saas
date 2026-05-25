import { z } from "zod";

const emptyToNull = (value) =>
  value === "" ? null : value;

const nullableText = z.preprocess(
  emptyToNull,
  z.string().trim().nullable().optional()
);

const financeBodySchema = z.object({
  category_id: z.string().uuid("Selecciona una categoria valida"),

  income_type: z
    .enum([
      "participant_payment",
      "donation",
      "sponsorship",
      "event_income",
      "other"
    ])
    .optional(),

  participant_id: z
    .preprocess(
      emptyToNull,
      z.string()
        .uuid("Selecciona un participante valido")
        .nullable()
        .optional()
    ),

  title: z
    .string()
    .trim()
    .min(3, "El titulo debe tener al menos 3 caracteres"),

  description: nullableText,

  amount: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0"),

  movement_date: z
    .string()
    .min(1, "La fecha es obligatoria"),

  payment_method: z
    .string()
    .trim()
    .min(2, "Ingresa el metodo de pago"),

  status: z.enum([
    "pending",
    "completed",
    "cancelled"
  ]),

  installment_number: z.preprocess(
    emptyToNull,
    z.coerce
      .number()
      .int()
      .min(1, "La cuota debe ser mayor a 0")
      .nullable()
      .optional()
  ),

  receipt_number: z
    .preprocess(
      emptyToNull,
      z.string().trim().max(80).nullable().optional()
    ),

  attachment_url: nullableText,

  notes: nullableText,

  responsible: nullableText,

  authorized_by: nullableText,

  receipt_reference: nullableText

}).superRefine((value, ctx) => {

  if (
    value.income_type === "participant_payment" &&
    !value.participant_id
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["participant_id"],
      message:
        "El participante es obligatorio para aportes"
    });
  }
});

export const createFinanceSchema = z.object({
  body: financeBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const financeSchema = financeBodySchema;

export const updateFinanceSchema = z.object({
  body: financeBodySchema,
  params: z.object({
    id: z.string().uuid("ID invalido")
  }),
  query: z.object({}).optional()
});

export const financeParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("ID invalido")
  }),
  query: z.object({}).optional()
});

export const financeFilterSchema =
  z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    category_id: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional()
  });

export const listFinanceSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({}).optional(),

  query: financeFilterSchema.extend({

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    page_size: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    sort_by: z.string().optional(),

    sort_order: z
      .enum(["asc", "desc"])
      .optional(),

    income_type: z.string().optional(),

    participant_id: z.string().optional()
  })
});
