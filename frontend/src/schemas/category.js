import { z } from "zod";

export const categorySchema = z.object({
  type: z.enum(["income", "expense"]),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  color: z.string().trim().min(4, "Selecciona un color"),
  active: z.boolean().default(true)
});
