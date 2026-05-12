import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  resetPasswordAction
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from "../validators/auth.validators.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.get("/me", authMiddleware, asyncHandler(me));
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordAction)
);
