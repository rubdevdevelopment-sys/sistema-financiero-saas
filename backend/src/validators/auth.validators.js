import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: z.string().min(8)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
