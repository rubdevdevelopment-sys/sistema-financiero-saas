import { z } from "zod";

export const participantSchema = z.object({
  document_number: z.string().trim().min(5, "El documento debe tener al menos 5 caracteres"),
  full_name: z.string().trim().min(3, "Ingresa el nombre completo"),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Correo invalido").optional().or(z.literal("")),
  target_amount: z.coerce.number().min(0, "La meta no puede ser negativa"),
  observations: z.string().trim().optional().or(z.literal("")),
  active: z.boolean().default(true)
});
