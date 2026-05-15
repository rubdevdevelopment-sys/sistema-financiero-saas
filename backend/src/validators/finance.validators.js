import { z } from "zod";

export const createFinanceSchema = z.object({
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
    .string()
    .uuid("Selecciona un participante valido")
    .nullable()
    .optional(),

  title: z
    .string()
    .trim()
    .min(3, "El titulo debe tener al menos 3 caracteres"),

  description: z
    .string()
    .trim()
    .nullable()
    .optional(),

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

  installment_number: z.coerce
    .number()
    .int()
    .min(1, "La cuota debe ser mayor a 0")
    .nullable()
    .optional(),

  receipt_number: z
    .string()
    .trim()
    .max(80)
    .nullable()
    .optional(),

  attachment_url: z
    .string()
    .trim()
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),

  responsible: z
    .string()
    .trim()
    .nullable()
    .optional(),

  authorized_by: z
    .string()
    .trim()
    .nullable()
    .optional(),

  receipt_reference: z
    .string()
    .trim()
    .nullable()
    .optional()

}).superRefine((value, ctx) => {

  const incomeType =
    value.income_type ?? "participant_payment";

  if (
    incomeType === "participant_payment" &&
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

export const financeSchema = createFinanceSchema;

export const updateFinanceSchema = createFinanceSchema;

export const financeParamsSchema = z.object({
  id: z.string().uuid("ID invalido")
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