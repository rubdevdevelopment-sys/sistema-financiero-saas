import { z } from "zod";

export const financeSchema = z.object({
  category_id: z.string().uuid("Selecciona una categoria valida"),
  income_type: z
    .enum(["participant_payment", "donation", "sponsorship", "event_income", "other"])
    .optional(),
  participant_id: z
  .string()
  .uuid("Selecciona un participante valido")
  .nullable()
  .optional()
  .or(z.literal("")),
  title: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres"),
  description: z.string().trim().optional().or(z.literal("")),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  movement_date: z.string().min(1, "La fecha es obligatoria"),
  payment_method: z.string().trim().min(2, "Ingresa el metodo de pago"),
  status: z.enum(["pending", "completed", "cancelled"]),
installment_number: z
  .union([
    z.coerce.number().int().min(1, "La cuota debe ser mayor a 0"),
    z.literal(""),
    z.null(),
    z.undefined()
  ])
  .optional(),
  receipt_number: z.string().trim().max(80).optional().or(z.literal("")),
 attachment_url: z
  .string()
  .trim()
  .optional()
  .nullable()
  .or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  responsible: z.string().trim().optional().or(z.literal("")),
  authorized_by: z.string().trim().optional().or(z.literal("")),
  receipt_reference: z.string().trim().optional().or(z.literal(""))
}).superRefine((value, ctx) => {
  const incomeType = value.income_type ?? "participant_payment";

  if (
    incomeType === "participant_payment" &&
    (!value.participant_id || value.participant_id === "")
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["participant_id"],
      message: "El participante es obligatorio para aportes"
    });
  }
});

export const financeFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  category_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
});
