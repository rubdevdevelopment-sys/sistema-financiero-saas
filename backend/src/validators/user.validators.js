import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    company_id: z.string().uuid(),
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["super_admin", "admin", "operator", "client"]),
    active: z.boolean().optional().default(true)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(3),
    role: z.enum(["super_admin", "admin", "operator", "client"]),
    active: z.boolean()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).optional()
});
